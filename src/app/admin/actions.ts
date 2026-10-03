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
import { db } from "@/lib/db";

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

type StoredAnswer = { text: string; isCorrect: boolean };

function parseAnswers(value: unknown): StoredAnswer[] {
  if (
    !Array.isArray(value) ||
    !value.every(
      (a) =>
        a &&
        typeof a === "object" &&
        typeof (a as StoredAnswer).text === "string" &&
        typeof (a as StoredAnswer).isCorrect === "boolean",
    )
  ) {
    throw new Error("Submission answers have an unexpected shape");
  }
  return value as StoredAnswer[];
}

export async function approveSubmission(id: string) {
  if (!(await isAdmin())) redirect("/admin");

  await db.$transaction(async (tx) => {
    // Claim it first so a double click can't create the question twice.
    const claimed = await tx.questionSubmission.updateMany({
      where: { id, status: "pending" },
      data: { status: "approved" },
    });
    if (claimed.count === 0) return;

    const submission = await tx.questionSubmission.findUniqueOrThrow({
      where: { id },
    });
    await tx.question.create({
      data: {
        quizId: submission.quizId,
        text: submission.text,
        difficulty: submission.difficulty,
        explanation: submission.explanation,
        creditName: submission.creditName,
        approved: true,
        answers: { create: parseAnswers(submission.answers) },
      },
    });
  });

  revalidatePath("/admin");
}

export async function rejectSubmission(id: string) {
  if (!(await isAdmin())) redirect("/admin");
  await db.questionSubmission.updateMany({
    where: { id, status: "pending" },
    data: { status: "rejected" },
  });
  revalidatePath("/admin");
}
