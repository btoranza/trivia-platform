import { describe, expect, it } from "vitest";
import { triviaConfig } from "@/config/trivia";
import { FEEDBACK_LIMITS, validateFeedback } from "@/lib/feedback";

const errors = triviaConfig.form.errors;

describe("validateFeedback", () => {
  it("trims the message and the name", () => {
    const result = validateFeedback(
      { message: "  Love it  ", creditName: "  Ana ", anonymous: false },
      errors,
    );
    expect(result).toEqual({
      ok: true,
      data: { message: "Love it", creditName: "Ana" },
    });
  });

  it("requires a message", () => {
    const result = validateFeedback(
      { message: "   ", creditName: "", anonymous: false },
      errors,
    );
    expect(result).toEqual({ ok: false, errors: { message: errors.required } });
  });

  it("rejects a message that is too long", () => {
    const result = validateFeedback(
      {
        message: "a".repeat(FEEDBACK_LIMITS.message + 1),
        creditName: "",
        anonymous: false,
      },
      errors,
    );
    expect(result).toEqual({ ok: false, errors: { message: errors.tooLong } });
  });

  it("rejects a name that is too long", () => {
    const result = validateFeedback(
      {
        message: "Hi",
        creditName: "a".repeat(FEEDBACK_LIMITS.name + 1),
        anonymous: false,
      },
      errors,
    );
    expect(result).toEqual({
      ok: false,
      errors: { creditName: errors.tooLong },
    });
  });

  it("stores no name when anonymous, even if one was typed", () => {
    const result = validateFeedback(
      { message: "Hi", creditName: "Ana", anonymous: true },
      errors,
    );
    expect(result).toEqual({
      ok: true,
      data: { message: "Hi", creditName: null },
    });
  });

  it("stores no name when it is left blank", () => {
    const result = validateFeedback(
      { message: "Hi", creditName: "  ", anonymous: false },
      errors,
    );
    expect(result).toEqual({
      ok: true,
      data: { message: "Hi", creditName: null },
    });
  });
});
