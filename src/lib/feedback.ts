import type { TriviaConfig } from "@/config/trivia";

export const FEEDBACK_LIMITS = {
  message: 500,
  name: 40,
} as const;

export type FeedbackInput = {
  message: string;
  creditName: string;
  anonymous: boolean;
};

export type FeedbackData = {
  message: string;
  creditName: string | null;
};

export type FeedbackErrors = Partial<Record<"message" | "creditName", string>>;

type Errors = TriviaConfig["form"]["errors"];

/** Pure validation; returns trimmed data ready to store, or per-field errors. */
export function validateFeedback(
  input: FeedbackInput,
  errors: Errors,
): { ok: true; data: FeedbackData } | { ok: false; errors: FeedbackErrors } {
  const found: FeedbackErrors = {};
  const message = input.message.trim();
  const name = input.creditName.trim();

  if (!message) found.message = errors.required;
  else if (message.length > FEEDBACK_LIMITS.message) {
    found.message = errors.tooLong;
  }

  if (!input.anonymous && name.length > FEEDBACK_LIMITS.name) {
    found.creditName = errors.tooLong;
  }

  if (Object.keys(found).length > 0) return { ok: false, errors: found };

  return {
    ok: true,
    data: { message, creditName: input.anonymous || !name ? null : name },
  };
}
