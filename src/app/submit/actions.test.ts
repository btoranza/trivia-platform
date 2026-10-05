import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  quiz: { findUnique: vi.fn() },
  questionSubmission: { create: vi.fn() },
}));
vi.mock("@/lib/db", () => ({ db }));
const notifyAdmin = vi.hoisted(() => vi.fn());
vi.mock("@/lib/notify", () => ({ notifyAdmin }));
// `after` only works inside a real request, so run its callback right away.
vi.mock("next/server", () => ({ after: (fn: () => void) => fn() }));

import { triviaConfig } from "@/config/trivia";
import { submitQuestion, type SubmitState } from "@/app/submit/actions";

const idle: SubmitState = {
  status: "idle",
  errors: {},
  values: {
    text: "",
    answers: ["", "", "", ""],
    difficulty: "Medium",
    explanation: "",
    creditName: "",
    anonymous: false,
  },
};

function form(overrides: Record<string, string> = {}) {
  const fields: Record<string, string> = {
    text: "What does CSS stand for?",
    "answer-0": "Cascading Style Sheets",
    "answer-1": "Creative Style System",
    "answer-2": "Computed Style Sheets",
    "answer-3": "Colorful Style Sheets",
    difficulty: "Easy",
    explanation: "It describes how styles cascade.",
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
  db.questionSubmission.create.mockResolvedValue({});
});

describe("submitQuestion", () => {
  it("stores a valid submission as pending and resets the form", async () => {
    const state = await submitQuestion(idle, form());

    expect(db.quiz.findUnique).toHaveBeenCalledWith({
      where: { slug: triviaConfig.slug },
    });
    expect(db.questionSubmission.create).toHaveBeenCalledWith({
      data: {
        quizId: "quiz-1",
        status: "pending",
        text: "What does CSS stand for?",
        difficulty: "Easy",
        answers: [
          { text: "Cascading Style Sheets", isCorrect: true },
          { text: "Creative Style System", isCorrect: false },
          { text: "Computed Style Sheets", isCorrect: false },
          { text: "Colorful Style Sheets", isCorrect: false },
        ],
        explanation: "It describes how styles cascade.",
        creditName: "Ana",
      },
    });
    expect(state.status).toBe("success");
    expect(state.values.text).toBe("");
    expect(state.values.difficulty).toBe(triviaConfig.defaultDifficulty);
  });

  it("stores no credit name when the author stays anonymous", async () => {
    await submitQuestion(idle, form({ anonymous: "on" }));
    expect(db.questionSubmission.create.mock.calls[0][0].data.creditName).toBeNull();
  });

  it("returns field errors and keeps what was typed, without touching the database", async () => {
    const state = await submitQuestion(idle, form({ text: "", explanation: "" }));

    expect(state.status).toBe("error");
    expect(state.errors).toMatchObject({
      text: triviaConfig.form.errors.required,
      explanation: triviaConfig.form.errors.required,
    });
    expect(state.values.answers[0]).toBe("Cascading Style Sheets");
    expect(db.questionSubmission.create).not.toHaveBeenCalled();
  });

  it("pretends success but saves nothing when the honeypot is filled", async () => {
    const state = await submitQuestion(idle, form({ website: "http://spam.example" }));

    expect(state.status).toBe("success");
    expect(db.quiz.findUnique).not.toHaveBeenCalled();
    expect(db.questionSubmission.create).not.toHaveBeenCalled();
  });

  it("shows a generic error when the quiz does not exist", async () => {
    db.quiz.findUnique.mockResolvedValue(null);
    const state = await submitQuestion(idle, form());

    expect(state.status).toBe("error");
    expect(state.formError).toBe(triviaConfig.form.errors.generic);
    expect(db.questionSubmission.create).not.toHaveBeenCalled();
  });

  it("shows a generic error and keeps the values when saving fails", async () => {
    db.questionSubmission.create.mockRejectedValue(new Error("db down"));
    const state = await submitQuestion(idle, form());

    expect(state.status).toBe("error");
    expect(state.formError).toBe(triviaConfig.form.errors.generic);
    expect(state.values.text).toBe("What does CSS stand for?");
  });
});

describe("notifications", () => {
  it("notifies the admin after saving", async () => {
    await submitQuestion(idle, form());

    expect(notifyAdmin).toHaveBeenCalledTimes(1);
    expect(notifyAdmin.mock.calls[0][0]).toContain("New question");
  });

  it("does not notify when validation fails", async () => {
    await submitQuestion(idle, form({ text: "  " }));

    expect(notifyAdmin).not.toHaveBeenCalled();
  });

  it("does not notify when saving fails", async () => {
    db.questionSubmission.create.mockRejectedValue(new Error("db down"));
    await submitQuestion(idle, form());

    expect(notifyAdmin).not.toHaveBeenCalled();
  });

  it("does not notify for the honeypot", async () => {
    await submitQuestion(idle, form({ website: "http://spam" }));

    expect(notifyAdmin).not.toHaveBeenCalled();
  });
});
