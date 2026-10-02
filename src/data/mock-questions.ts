import type { QuestionWithAnswers } from "@/types/quiz";

const QUIZ_ID = "quiz-danielle-trivia";

function make(
  n: number,
  text: string,
  difficulty: string,
  answers: [string, boolean][],
): QuestionWithAnswers {
  const id = `q${n}`;
  return {
    id,
    quizId: QUIZ_ID,
    text,
    difficulty,
    approved: true,
    answers: answers.map(([t, isCorrect], i) => ({
      id: `${id}-a${i + 1}`,
      questionId: id,
      text: t,
      isCorrect,
    })),
  };
}

function placeholder(n: number, difficulty: string): QuestionWithAnswers {
  return make(n, `[Placeholder question ${n}]`, difficulty, [
    ["[Placeholder correct answer]", true],
    ["[Placeholder wrong answer A]", false],
    ["[Placeholder wrong answer B]", false],
    ["[Placeholder wrong answer C]", false],
  ]);
}

const difficulties = ["Easy", "Medium", "Hard"];

export const mockQuestions: QuestionWithAnswers[] = [
  make(1, "What does the community call itself?", "Easy", [
    ["Walnuts", true],
    ["Peanuts", false],
    ["Almonds", false],
    ["Cashews", false],
  ]),
  ...Array.from({ length: 11 }, (_, i) =>
    placeholder(i + 2, difficulties[i % difficulties.length]),
  ),
];
