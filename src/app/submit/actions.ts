"use server";

import { triviaConfig as config } from "@/config/trivia";
import { db } from "@/lib/db";
import {
  ANSWER_COUNT,
  validateSubmission,
  type FieldErrors,
} from "@/lib/submissions";

export type FormValues = {
  text: string;
  answers: string[];
  correct: string;
  difficulty: string;
  explanation: string;
  creditName: string;
  anonymous: boolean;
};

export type SubmitState = {
  status: "idle" | "error" | "success";
  errors: FieldErrors;
  formError?: string;
  values: FormValues;
};

const str = (formData: FormData, key: string) => {
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
};

export async function submitQuestion(
  _prev: SubmitState,
  formData: FormData,
): Promise<SubmitState> {
  const values: FormValues = {
    text: str(formData, "text"),
    answers: Array.from({ length: ANSWER_COUNT }, (_, i) =>
      str(formData, `answer-${i}`),
    ),
    correct: str(formData, "correct"),
    difficulty: str(formData, "difficulty"),
    explanation: str(formData, "explanation"),
    creditName: str(formData, "creditName"),
    anonymous: formData.get("anonymous") === "on",
  };
  const empty: FormValues = {
    text: "",
    answers: ["", "", "", ""],
    correct: "",
    difficulty: config.defaultDifficulty,
    explanation: "",
    creditName: "",
    anonymous: false,
  };

  // Honeypot: real users never see or fill this field. Pretend it worked.
  if (str(formData, "website") !== "") {
    return { status: "success", errors: {}, values: empty };
  }

  const result = validateSubmission(
    {
      text: values.text,
      answers: values.answers,
      correctIndex: values.correct === "" ? -1 : Number(values.correct),
      difficulty: values.difficulty,
      explanation: values.explanation,
      creditName: values.creditName,
      anonymous: values.anonymous,
    },
    config.difficulties,
    config.form.errors,
  );
  if (!result.ok) return { status: "error", errors: result.errors, values };

  try {
    const quiz = await db.quiz.findUnique({ where: { slug: config.slug } });
    if (!quiz) throw new Error(`Quiz "${config.slug}" not found`);
    await db.questionSubmission.create({
      data: { quizId: quiz.id, status: "pending", ...result.data },
    });
  } catch (err) {
    console.error("Failed to save submission", err);
    return {
      status: "error",
      errors: {},
      formError: config.form.errors.generic,
      values,
    };
  }

  return { status: "success", errors: {}, values: empty };
}
