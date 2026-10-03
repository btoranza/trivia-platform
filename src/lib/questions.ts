import { db } from "@/lib/db";
import { mockQuestions } from "@/data/mock-questions";
import type { QuestionWithAnswers } from "@/types/quiz";

/**
 * Approved questions for a quiz: real ones from the database plus the mock
 * examples (visual placeholders only, never written to the database).
 */
export async function getQuestions(
  quizSlug: string,
): Promise<QuestionWithAnswers[]> {
  const questions = await db.question.findMany({
    where: { approved: true, quiz: { slug: quizSlug } },
    include: { answers: true },
  });

  return [...questions, ...mockQuestions.filter((q) => q.approved)];
}
