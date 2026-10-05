"use server";

import { after } from "next/server";
import { triviaConfig as config } from "@/config/trivia";
import { db } from "@/lib/db";
import { notifyAdmin } from "@/lib/notify";
import { validateFeedback, type FeedbackErrors } from "@/lib/feedback";

export type FeedbackValues = {
  message: string;
  creditName: string;
  anonymous: boolean;
};

export type FeedbackState = {
  status: "idle" | "error" | "success";
  errors: FeedbackErrors;
  formError?: string;
  values: FeedbackValues;
};

const str = (formData: FormData, key: string) => {
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
};

export async function submitFeedback(
  _prev: FeedbackState,
  formData: FormData,
): Promise<FeedbackState> {
  const values: FeedbackValues = {
    message: str(formData, "message"),
    creditName: str(formData, "creditName"),
    anonymous: formData.get("anonymous") === "on",
  };
  const empty: FeedbackValues = {
    message: "",
    creditName: "",
    anonymous: false,
  };

  // Honeypot: real users never see or fill this field. Pretend it worked.
  if (str(formData, "website") !== "") {
    return { status: "success", errors: {}, values: empty };
  }

  const result = validateFeedback(values, config.form.errors);
  if (!result.ok) return { status: "error", errors: result.errors, values };

  try {
    const quiz = await db.quiz.findUnique({ where: { slug: config.slug } });
    if (!quiz) throw new Error(`Quiz "${config.slug}" not found`);
    await db.feedback.create({ data: { quizId: quiz.id, ...result.data } });
  } catch (err) {
    console.error("Failed to save feedback", err);
    return {
      status: "error",
      errors: {},
      formError: config.form.errors.generic,
      values,
    };
  }

  after(() => notifyAdmin("New feedback note:"));
  return { status: "success", errors: {}, values: empty };
}
