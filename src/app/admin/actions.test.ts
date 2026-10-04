import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const db = {
    questionSubmission: {
      updateMany: vi.fn(),
      findUniqueOrThrow: vi.fn(),
    },
    question: { create: vi.fn() },
    $transaction: vi.fn(),
  };
  return {
    db,
    cookieStore: { get: vi.fn(), set: vi.fn(), delete: vi.fn() },
    redirect: vi.fn(),
    revalidatePath: vi.fn(),
  };
});

vi.mock("@/lib/db", () => ({ db: mocks.db }));
vi.mock("next/headers", () => ({ cookies: async () => mocks.cookieStore }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));

import { triviaConfig } from "@/config/trivia";
import { ADMIN_COOKIE, createSessionToken } from "@/lib/admin-auth";
import { login, logout, reviewSubmission } from "@/app/admin/actions";

const { db, cookieStore, redirect, revalidatePath } = mocks;

class Redirect extends Error {}

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [k, v] of Object.entries(fields)) data.set(k, v);
  return data;
}

const edits = {
  text: "What does CSS stand for?",
  "answer-0": "Cascading Style Sheets",
  "answer-1": "Creative Style System",
  "answer-2": "Computed Style Sheets",
  "answer-3": "Colorful Style Sheets",
  difficulty: "Easy",
  explanation: "It describes how styles cascade.",
};
const expectedEdits = {
  text: "What does CSS stand for?",
  difficulty: "Easy",
  explanation: "It describes how styles cascade.",
  answers: [
    { text: "Cascading Style Sheets", isCorrect: true },
    { text: "Creative Style System", isCorrect: false },
    { text: "Computed Style Sheets", isCorrect: false },
    { text: "Colorful Style Sheets", isCorrect: false },
  ],
};

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("ADMIN_PASSWORD", "s3cret");
  // Like Next's redirect(), it never returns.
  redirect.mockImplementation((url: string) => {
    throw new Redirect(url);
  });
  db.$transaction.mockImplementation((fn: (tx: typeof db) => unknown) => fn(db));
  db.questionSubmission.updateMany.mockResolvedValue({ count: 1 });
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

describe("login", () => {
  it("sets a session cookie and redirects to /admin with the right password", async () => {
    await expect(login({}, form({ password: "s3cret" }))).rejects.toThrow(Redirect);

    expect(cookieStore.set).toHaveBeenCalledTimes(1);
    const [name, token, options] = cookieStore.set.mock.calls[0];
    expect(name).toBe(ADMIN_COOKIE);
    expect(token).toMatch(/^\d+\.[0-9a-f]{64}$/);
    expect(options).toMatchObject({ httpOnly: true, sameSite: "lax", path: "/admin" });
    expect(redirect).toHaveBeenCalledWith("/admin");
  });

  it("rejects a wrong password after a delay, without setting a cookie", async () => {
    vi.useFakeTimers();
    const result = login({}, form({ password: "nope" }));
    await vi.advanceTimersByTimeAsync(600);

    await expect(result).resolves.toEqual({ error: "Wrong password." });
    expect(cookieStore.set).not.toHaveBeenCalled();
  });

  it("rejects a missing password", async () => {
    vi.useFakeTimers();
    const result = login({}, form({}));
    await vi.advanceTimersByTimeAsync(600);
    await expect(result).resolves.toEqual({ error: "Wrong password." });
  });

  it("stays closed when ADMIN_PASSWORD is not set", async () => {
    vi.stubEnv("ADMIN_PASSWORD", "");
    vi.useFakeTimers();
    const result = login({}, form({ password: "" }));
    await vi.advanceTimersByTimeAsync(600);

    await expect(result).resolves.toEqual({ error: "Wrong password." });
    expect(cookieStore.set).not.toHaveBeenCalled();
  });
});

describe("logout", () => {
  it("deletes the cookie and redirects to /admin", async () => {
    await expect(logout()).rejects.toThrow(Redirect);
    expect(cookieStore.delete).toHaveBeenCalledWith({ name: ADMIN_COOKIE, path: "/admin" });
    expect(redirect).toHaveBeenCalledWith("/admin");
  });
});

describe("reviewSubmission", () => {
  const review = (fields: Record<string, string>) =>
    reviewSubmission("sub-1", { errors: {} }, form(fields));

  const signIn = () =>
    cookieStore.get.mockReturnValue({ value: createSessionToken() });

  it("sends visitors without a session back to /admin and changes nothing", async () => {
    cookieStore.get.mockReturnValue(undefined);

    await expect(review({ intent: "reject" })).rejects.toThrow(Redirect);
    expect(db.questionSubmission.updateMany).not.toHaveBeenCalled();
    expect(db.$transaction).not.toHaveBeenCalled();
  });

  it("rejects a forged session cookie", async () => {
    cookieStore.get.mockReturnValue({ value: "9999999999.deadbeef" });
    await expect(review({ intent: "approve", ...edits })).rejects.toThrow(Redirect);
    expect(db.$transaction).not.toHaveBeenCalled();
  });

  describe("signed in", () => {
    beforeEach(signIn);

    it("rejects only a pending submission", async () => {
      const state = await review({ intent: "reject" });

      expect(db.questionSubmission.updateMany).toHaveBeenCalledWith({
        where: { id: "sub-1", status: "pending" },
        data: { status: "rejected" },
      });
      expect(revalidatePath).toHaveBeenCalledWith("/admin");
      expect(state).toEqual({ errors: {} });
    });

    it("saves edits to a pending submission without approving it", async () => {
      const state = await review({ intent: "save", ...edits });

      expect(db.questionSubmission.updateMany).toHaveBeenCalledWith({
        where: { id: "sub-1", status: "pending" },
        data: expectedEdits,
      });
      expect(db.question.create).not.toHaveBeenCalled();
      expect(state).toEqual({ errors: {}, saved: true });
    });

    it("returns validation errors instead of saving invalid edits", async () => {
      const state = await review({ intent: "save", ...edits, text: "" });

      expect(state.errors.text).toBe(triviaConfig.form.errors.required);
      expect(db.questionSubmission.updateMany).not.toHaveBeenCalled();
    });

    it("does not approve invalid edits", async () => {
      const state = await review({ intent: "approve", ...edits, difficulty: "Nope" });

      expect(state.errors.difficulty).toBeDefined();
      expect(db.$transaction).not.toHaveBeenCalled();
    });

    it("approves: claims the submission, then creates an approved question keeping the credit", async () => {
      db.questionSubmission.findUniqueOrThrow.mockResolvedValue({
        id: "sub-1",
        quizId: "quiz-1",
        creditName: "Ana",
      });

      const state = await review({ intent: "approve", ...edits });

      expect(db.questionSubmission.updateMany).toHaveBeenCalledWith({
        where: { id: "sub-1", status: "pending" },
        data: { ...expectedEdits, status: "approved" },
      });
      expect(db.question.create).toHaveBeenCalledWith({
        data: {
          quizId: "quiz-1",
          ...expectedEdits,
          creditName: "Ana",
          approved: true,
          answers: { create: expectedEdits.answers },
        },
      });
      expect(revalidatePath).toHaveBeenCalledWith("/admin");
      expect(state).toEqual({ errors: {} });
    });

    it("does not create the question twice when the submission was already handled", async () => {
      db.questionSubmission.updateMany.mockResolvedValue({ count: 0 });

      await review({ intent: "approve", ...edits });

      expect(db.questionSubmission.findUniqueOrThrow).not.toHaveBeenCalled();
      expect(db.question.create).not.toHaveBeenCalled();
    });

    it("keeps an anonymous credit as null when approving", async () => {
      db.questionSubmission.findUniqueOrThrow.mockResolvedValue({
        id: "sub-1",
        quizId: "quiz-1",
        creditName: null,
      });

      await review({ intent: "approve", ...edits });

      expect(db.question.create.mock.calls[0][0].data.creditName).toBeNull();
    });

    it("returns a generic error for an unknown intent", async () => {
      const state = await review({ intent: "delete", ...edits });

      expect(state.formError).toBe(triviaConfig.form.errors.generic);
      expect(db.questionSubmission.updateMany).not.toHaveBeenCalled();
    });
  });
});
