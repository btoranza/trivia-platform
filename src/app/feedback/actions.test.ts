import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  quiz: { findUnique: vi.fn() },
  feedback: { create: vi.fn() },
}));
vi.mock("@/lib/db", () => ({ db }));
const notifyAdmin = vi.hoisted(() => vi.fn());
vi.mock("@/lib/notify", () => ({ notifyAdmin }));
// `after` only works inside a real request, so run its callback right away.
vi.mock("next/server", () => ({ after: (fn: () => void) => fn() }));

import { triviaConfig } from "@/config/trivia";
import { submitFeedback, type FeedbackState } from "@/app/feedback/actions";

const idle: FeedbackState = {
  status: "idle",
  errors: {},
  values: { message: "", creditName: "", anonymous: false },
};

function form(overrides: Record<string, string> = {}) {
  const fields: Record<string, string> = {
    message: "Great quiz, please add dark mode.",
    creditName: "Ana",
    ...overrides,
  };
  const data = new FormData();
  for (const [k, v] of Object.entries(fields)) data.set(k, v);
  return data;
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  db.quiz.findUnique.mockResolvedValue({ id: "quiz-1" });
  db.feedback.create.mockResolvedValue({});
});

describe("submitFeedback", () => {
  it("stores a valid note and resets the form", async () => {
    const state = await submitFeedback(idle, form());

    expect(db.quiz.findUnique).toHaveBeenCalledWith({
      where: { slug: triviaConfig.slug },
    });
    expect(db.feedback.create).toHaveBeenCalledWith({
      data: {
        quizId: "quiz-1",
        message: "Great quiz, please add dark mode.",
        creditName: "Ana",
      },
    });
    expect(state).toEqual({
      status: "success",
      errors: {},
      values: { message: "", creditName: "", anonymous: false },
    });
  });

  it("stores no name when the sender stays anonymous", async () => {
    await submitFeedback(idle, form({ anonymous: "on" }));

    expect(db.feedback.create.mock.calls[0][0].data.creditName).toBeNull();
  });

  it("returns field errors and keeps what was typed", async () => {
    const state = await submitFeedback(idle, form({ message: "  " }));

    expect(state.status).toBe("error");
    expect(state.errors.message).toBe(triviaConfig.form.errors.required);
    expect(state.values.creditName).toBe("Ana");
    expect(db.feedback.create).not.toHaveBeenCalled();
  });

  it("pretends to succeed when the honeypot is filled, storing nothing", async () => {
    const state = await submitFeedback(idle, form({ website: "http://spam" }));

    expect(state.status).toBe("success");
    expect(db.feedback.create).not.toHaveBeenCalled();
  });

  it("shows a generic error when the quiz is missing", async () => {
    db.quiz.findUnique.mockResolvedValue(null);

    const state = await submitFeedback(idle, form());

    expect(state.status).toBe("error");
    expect(state.formError).toBe(triviaConfig.form.errors.generic);
  });

  it("shows a generic error when saving fails", async () => {
    db.feedback.create.mockRejectedValue(new Error("db down"));

    const state = await submitFeedback(idle, form());

    expect(state.status).toBe("error");
    expect(state.formError).toBe(triviaConfig.form.errors.generic);
    expect(state.values.message).toBe("Great quiz, please add dark mode.");
  });
});

describe("notifications", () => {
  it("notifies the admin after saving", async () => {
    await submitFeedback(idle, form());

    expect(notifyAdmin).toHaveBeenCalledTimes(1);
    expect(notifyAdmin.mock.calls[0][0]).toContain("New feedback");
  });

  it("does not notify when validation fails", async () => {
    await submitFeedback(idle, form({ message: "  " }));

    expect(notifyAdmin).not.toHaveBeenCalled();
  });

  it("does not notify when saving fails", async () => {
    db.feedback.create.mockRejectedValue(new Error("db down"));
    await submitFeedback(idle, form());

    expect(notifyAdmin).not.toHaveBeenCalled();
  });

  it("does not notify for the honeypot", async () => {
    await submitFeedback(idle, form({ website: "http://spam" }));

    expect(notifyAdmin).not.toHaveBeenCalled();
  });
});
