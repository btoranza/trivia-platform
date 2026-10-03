import type { TriviaConfig } from "@/config/trivia";

export const LIMITS = {
  question: 200,
  answer: 100,
  explanation: 400,
  name: 40,
} as const;

export const ANSWER_COUNT = 4;

export type SubmissionInput = {
  text: string;
  /** The first answer is the correct one; the rest are wrong. */
  answers: string[];
  difficulty: string;
  explanation: string;
  creditName: string;
  anonymous: boolean;
};

export type SubmissionData = {
  text: string;
  difficulty: string;
  answers: { text: string; isCorrect: boolean }[];
  explanation: string;
  creditName: string | null;
};

export type FieldErrors = Partial<
  Record<
    "text" | "answers" | "difficulty" | "explanation" | "creditName",
    string
  >
>;

type Errors = TriviaConfig["form"]["errors"];

/** Pure validation; returns trimmed data ready to store, or per-field errors. */
export function validateSubmission(
  input: SubmissionInput,
  difficulties: readonly string[],
  errors: Errors,
): { ok: true; data: SubmissionData } | { ok: false; errors: FieldErrors } {
  const found: FieldErrors = {};
  const text = input.text.trim();
  const explanation = input.explanation.trim();
  const answers = input.answers.map((a) => a.trim());
  const name = input.creditName.trim();

  if (!text) found.text = errors.required;
  else if (text.length > LIMITS.question) found.text = errors.tooLong;

  if (answers.length !== ANSWER_COUNT || answers.some((a) => !a)) {
    found.answers = errors.required;
  } else if (answers.some((a) => a.length > LIMITS.answer)) {
    found.answers = errors.tooLong;
  } else if (
    new Set(answers.map((a) => a.toLowerCase())).size !== answers.length
  ) {
    found.answers = errors.duplicateAnswers;
  }

  if (!difficulties.includes(input.difficulty)) {
    found.difficulty = errors.required;
  }

  if (!explanation) found.explanation = errors.required;
  else if (explanation.length > LIMITS.explanation) {
    found.explanation = errors.tooLong;
  }

  if (!input.anonymous && name.length > LIMITS.name) {
    found.creditName = errors.tooLong;
  }

  if (Object.keys(found).length > 0) return { ok: false, errors: found };

  return {
    ok: true,
    data: {
      text,
      difficulty: input.difficulty,
      answers: answers.map((a, i) => ({
        text: a,
        isCorrect: i === 0,
      })),
      explanation,
      creditName: input.anonymous || !name ? null : name,
    },
  };
}
