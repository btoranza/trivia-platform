import { mockQuestions } from "@/data/mock-questions";
import type { QuestionWithAnswers } from "@/types/quiz";

/** Approved questions for a quiz. Async so the source can later be a database. */
export async function getQuestions(
  quizSlug: string,
): Promise<QuestionWithAnswers[]> {
  void quizSlug; // single mock quiz for now
  return mockQuestions.filter((q) => q.approved);
}
