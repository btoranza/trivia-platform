"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE,
  SESSION_MAX_AGE,
  checkPassword,
  createSessionToken,
  isAdmin,
} from "@/lib/admin-auth";
import { triviaConfig as config } from "@/config/trivia";
import { db } from "@/lib/db";
import {
  ANSWER_COUNT,
  validateSubmission,
  type FieldErrors,
} from "@/lib/submissions";

export type LoginState = { error?: string };

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const password = formData.get("password");
  const token = createSessionToken();
  if (typeof password !== "string" || !token || !checkPassword(password)) {
    // Small delay to slow down guessing.
    await new Promise((resolve) => setTimeout(resolve, 600));
    return { error: "Wrong password." };
  }
  const store = await cookies();
  store.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: SESSION_MAX_AGE,
  });
  redirect("/admin");
}

export async function logout() {
  const store = await cookies();
  store.delete({ name: ADMIN_COOKIE, path: "/admin" });
  redirect("/admin");
}

export type ReviewState = {
  errors: FieldErrors;
  formError?: string;
  saved?: boolean;
};

const str = (formData: FormData, key: string) => {
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
};

/**
 * One action for the review form. The submit button's `intent` decides:
 * save edits, approve (saving the edits first), or reject.
 */
export async function reviewSubmission(
  id: string,
  _prev: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  if (!(await isAdmin())) redirect("/admin");

  const intent = str(formData, "intent");

  if (intent === "reject") {
    await db.questionSubmission.updateMany({
      where: { id, status: "pending" },
      data: { status: "rejected" },
    });
    revalidatePath("/admin");
    return { errors: {} };
  }

  const result = validateSubmission(
    {
      text: str(formData, "text"),
      answers: Array.from({ length: ANSWER_COUNT }, (_, i) =>
        str(formData, `answer-${i}`),
      ),
      difficulty: str(formData, "difficulty"),
      explanation: str(formData, "explanation"),
      // Credit is not edited here; it is kept as submitted.
      creditName: "",
      anonymous: true,
    },
    config.difficulties,
    config.form.errors,
  );
  if (!result.ok) return { errors: result.errors };
  const { text, difficulty, answers, explanation } = result.data;
  const edits = { text, difficulty, answers, explanation };

  if (intent === "save") {
    await db.questionSubmission.updateMany({
      where: { id, status: "pending" },
      data: edits,
    });
    revalidatePath("/admin");
    return { errors: {}, saved: true };
  }

  if (intent === "approve") {
    await db.$transaction(async (tx) => {
      // Claim it first so a double click can't create the question twice.
      const claimed = await tx.questionSubmission.updateMany({
        where: { id, status: "pending" },
        data: { ...edits, status: "approved" },
      });
      if (claimed.count === 0) return;

      const submission = await tx.questionSubmission.findUniqueOrThrow({
        where: { id },
      });
      await tx.question.create({
        data: {
          quizId: submission.quizId,
          ...edits,
          creditName: submission.creditName,
          approved: true,
          answers: { create: answers },
        },
      });
    });
    revalidatePath("/admin");
    return { errors: {} };
  }

  return { errors: {}, formError: config.form.errors.generic };
}

/** Moves a feedback note to the "read" list. */
export async function markFeedbackHandled(id: string) {
  if (!(await isAdmin())) redirect("/admin");
  await db.feedback.updateMany({ where: { id }, data: { handled: true } });
  revalidatePath("/admin");
}

/** Moves a read feedback note back to the unread list. */
export async function markFeedbackUnread(id: string) {
  if (!(await isAdmin())) redirect("/admin");
  await db.feedback.updateMany({ where: { id }, data: { handled: false } });
  revalidatePath("/admin");
}

/** Permanently removes a feedback note from the database. */
export async function deleteFeedback(id: string) {
  if (!(await isAdmin())) redirect("/admin");
  await db.feedback.deleteMany({ where: { id } });
  revalidatePath("/admin");
}
