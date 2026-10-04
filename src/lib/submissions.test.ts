import { describe, expect, it } from "vitest";
import {
  LIMITS,
  validateSubmission,
  type SubmissionInput,
} from "@/lib/submissions";

const difficulties = ["Easy", "Medium", "Hard"];
const errors = {
  required: "required",
  tooLong: "too long",
  duplicateAnswers: "duplicate",
  generic: "generic",
} as Parameters<typeof validateSubmission>[2];

const valid: SubmissionInput = {
  text: "What does CSS stand for?",
  answers: ["Cascading Style Sheets", "Creative Style System", "Computed Style Sheets", "Colorful Style Sheets"],
  difficulty: "Easy",
  explanation: "It describes how styles cascade.",
  creditName: "Ana",
  anonymous: false,
};

const run = (overrides: Partial<SubmissionInput> = {}) =>
  validateSubmission({ ...valid, ...overrides }, difficulties, errors);

describe("validateSubmission", () => {
  it("accepts a valid submission and marks the first answer as correct", () => {
    const result = run();
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.answers.map((a) => a.isCorrect)).toEqual([true, false, false, false]);
    expect(result.data.creditName).toBe("Ana");
  });

  it("trims every field", () => {
    const result = run({
      text: "  Q?  ",
      explanation: "  why  ",
      answers: [" a ", " b ", " c ", " d "],
      creditName: "  Ana  ",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.text).toBe("Q?");
    expect(result.data.explanation).toBe("why");
    expect(result.data.answers.map((a) => a.text)).toEqual(["a", "b", "c", "d"]);
    expect(result.data.creditName).toBe("Ana");
  });

  it("requires text and explanation", () => {
    const result = run({ text: "   ", explanation: "" });
    expect(result).toEqual({
      ok: false,
      errors: { text: "required", explanation: "required" },
    });
  });

  it("enforces length limits exactly at the boundary", () => {
    expect(run({ text: "x".repeat(LIMITS.question) }).ok).toBe(true);
    expect(run({ text: "x".repeat(LIMITS.question + 1) })).toMatchObject({
      ok: false,
      errors: { text: "too long" },
    });
    expect(run({ explanation: "x".repeat(LIMITS.explanation + 1) })).toMatchObject({
      ok: false,
      errors: { explanation: "too long" },
    });
    expect(
      run({ answers: ["x".repeat(LIMITS.answer + 1), "b", "c", "d"] }),
    ).toMatchObject({ ok: false, errors: { answers: "too long" } });
  });

  it("requires exactly four non-empty answers", () => {
    expect(run({ answers: ["a", "b", "c"] })).toMatchObject({
      errors: { answers: "required" },
    });
    expect(run({ answers: ["a", "b", "c", "  "] })).toMatchObject({
      errors: { answers: "required" },
    });
  });

  it("rejects duplicate answers regardless of case or spacing", () => {
    expect(run({ answers: ["Yes", "yes ", "c", "d"] })).toMatchObject({
      ok: false,
      errors: { answers: "duplicate" },
    });
  });

  it("rejects an unknown difficulty", () => {
    expect(run({ difficulty: "Impossible" })).toMatchObject({
      errors: { difficulty: "required" },
    });
  });

  describe("credit name", () => {
    it("is null when anonymous, even if a name was typed", () => {
      const result = run({ anonymous: true, creditName: "Ana" });
      expect(result.ok && result.data.creditName).toBe(null);
    });

    it("is null when left blank", () => {
      const result = run({ creditName: "   " });
      expect(result.ok && result.data.creditName).toBe(null);
    });

    it("rejects a name that is too long", () => {
      expect(run({ creditName: "x".repeat(LIMITS.name + 1) })).toMatchObject({
        errors: { creditName: "too long" },
      });
    });

    it("ignores the name length when anonymous", () => {
      expect(run({ anonymous: true, creditName: "x".repeat(500) }).ok).toBe(true);
    });
  });
});
