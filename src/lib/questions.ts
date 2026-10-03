import { db } from "@/lib/db";
import type { QuestionWithAnswers } from "@/types/quiz";

/** Approved questions for a quiz, read from the database. */
export async function getQuestions(
  quizSlug: string,
): Promise<QuestionWithAnswers[]> {
  const questions = await db.question.findMany({
    where: { approved: true, quiz: { slug: quizSlug } },
    include: { answers: true },
  });

  return questions;
}
