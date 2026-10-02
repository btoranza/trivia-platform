import type { QuestionWithAnswers } from "@/types/quiz";

const QUIZ_ID = "quiz-danielle-trivia";

/** First answer is the correct one; the rest are wrong. */
function make(
  n: number,
  text: string,
  difficulty: string,
  [correct, ...wrong]: [string, string, string, string],
): QuestionWithAnswers {
  const id = `q${n}`;
  return {
    id,
    quizId: QUIZ_ID,
    text,
    difficulty,
    approved: true,
    answers: [correct, ...wrong].map((t, i) => ({
      id: `${id}-a${i + 1}`,
      questionId: id,
      text: t,
      isCorrect: i === 0,
    })),
  };
}

export const mockQuestions: QuestionWithAnswers[] = [
  make(
    1,
    'Who does she call herself "the brunette ___ of San Francisco"?',
    "Easy",
    ["Carrie Bradshaw", "Bridget Jones", "Elle Woods", "Rachel Green"],
  ),
  make(2, "What kind of content made her popular?", "Easy", [
    "Dating advice and her dating journey",
    "Fitness routines",
    "Cooking",
    "Travel vlogs",
  ]),
  make(3, "What is her fiancé's name?", "Easy", [
    "Lucas Alcantara",
    "Lucas Almeida",
    "Mateus Alcantara",
    "Lucas Andrade",
  ]),
  make(4, "Where is her boyfriend (now fiancé) from?", "Easy", [
    "Brazil",
    "Portugal",
    "Argentina",
    "Italy",
  ]),
  make(5, "What job did she quit to go full-time on social media?", "Medium", [
    "Tech sales",
    "Marketing",
    "Nursing",
    "Real estate",
  ]),
  make(
    6,
    "Which city did she live in before moving to San Francisco?",
    "Medium",
    ["San Jose", "Oakland", "Los Angeles", "Sacramento"],
  ),
  make(7, "Where did she first notice Lucas?", "Medium", [
    "At the gym",
    "On a dating app",
    "At a friend's party",
    "At a coffee shop",
  ]),
  make(8, "Where did the proposal happen?", "Medium", [
    "Half Moon Bay",
    "Napa Valley",
    "Lake Tahoe",
    "Big Sur",
  ]),
  make(9, "When did they meet?", "Medium", [
    "Summer 2025",
    "Spring 2024",
    "Winter 2025",
    "Fall 2023",
  ]),
  make(10, "Which video series first made her go viral?", "Medium", [
    '"Things I Wish I Knew at 25"',
    '"Dating in SF"',
    '"Red Flags Only"',
    '"Single Girl Diaries"',
  ]),
];
