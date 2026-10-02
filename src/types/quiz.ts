// Shapes mirror the future Prisma models.

export type Quiz = {
  id: string;
  slug: string;
  title: string;
};

export type Answer = {
  id: string;
  questionId: string;
  text: string;
  isCorrect: boolean;
};

export type Question = {
  id: string;
  quizId: string;
  text: string;
  difficulty: string;
  approved: boolean;
  explanation: string;
  /** Name shown as credit; null means the author chose to stay anonymous. */
  creditName?: string | null;
};

/** A question together with its answers, as returned by getQuestions. */
export type QuestionWithAnswers = Question & { answers: Answer[] };
