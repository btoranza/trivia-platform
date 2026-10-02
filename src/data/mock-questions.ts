import type { QuestionWithAnswers } from "@/types/quiz";

const QUIZ_ID = "quiz-danielle-trivia";

type Entry = {
  text: string;
  difficulty: string;
  /** First answer is the correct one; the rest are wrong. */
  answers: [string, string, string, string];
  explanation: string;
  creditName?: string;
};

const entries: Entry[] = [
  {
    creditName: "Test User",
    text: 'What does she call herself "the brunette ___ of San Francisco"?',
    difficulty: "Easy",
    answers: ["Carrie Bradshaw", "Bridget Jones", "Elle Woods", "Rachel Green"],
    explanation:
      "She describes herself as the brunette Carrie Bradshaw of San Francisco.",
  },
  {
    text: "What kind of content made her popular?",
    difficulty: "Easy",
    answers: [
      "Dating advice and her dating journey",
      "Fitness routines",
      "Cooking",
      "Travel vlogs",
    ],
    explanation:
      "She became known online for sharing her dating journey and dating advice.",
  },
  {
    text: "What is her fiancé's name?",
    difficulty: "Easy",
    answers: [
      "Lucas Alcantara",
      "Lucas Almeida",
      "Mateus Alcantara",
      "Lucas Andrade",
    ],
    explanation: "She is engaged to Lucas Alcantara.",
  },
  {
    text: "Where is her boyfriend (now fiancé) from?",
    difficulty: "Easy",
    answers: ["Brazil", "Portugal", "Argentina", "Italy"],
    explanation:
      "Before revealing him, she had been teasing a romance with a Brazilian man all summer.",
  },
  {
    creditName: "Test User",
    text: "What job did she quit to go full-time on social media?",
    difficulty: "Medium",
    answers: ["Tech sales", "Marketing", "Nursing", "Real estate"],
    explanation: "She left a tech sales job to work full time on social media.",
  },
  {
    text: "Which city did she live in before moving to San Francisco?",
    difficulty: "Medium",
    answers: ["San Jose", "Oakland", "Los Angeles", "Sacramento"],
    explanation:
      "She moved to San Francisco from San Jose, also in the Bay Area.",
  },
  {
    text: "Where did she first notice Lucas?",
    difficulty: "Medium",
    answers: [
      "At the gym",
      "On a dating app",
      "At a friend's party",
      "At a coffee shop",
    ],
    explanation:
      "She didn't meet him on a dating app or on one of her documented dates; she noticed him at the gym.",
  },
  {
    text: "Where did the proposal happen?",
    difficulty: "Medium",
    answers: ["Half Moon Bay", "Napa Valley", "Lake Tahoe", "Big Sur"],
    explanation:
      "He proposed in Half Moon Bay, near their home in San Francisco.",
  },
  {
    text: "When did they meet?",
    difficulty: "Medium",
    answers: ["Summer 2025", "Spring 2024", "Winter 2025", "Fall 2023"],
    explanation:
      "They met in the summer of 2025, after her move from San Jose.",
  },
  {
    text: "Which video series first made her go viral?",
    difficulty: "Medium",
    answers: [
      '"Things I Wish I Knew at 25"',
      '"Dating in SF"',
      '"Red Flags Only"',
      '"Single Girl Diaries"',
    ],
    explanation:
      'She first went viral with a "Things I Wish I Knew At 25" video giving advice from her past experiences.',
  },
  {
    text: "[Placeholder Hard question]",
    difficulty: "Hard",
    answers: [
      "[Placeholder correct answer]",
      "[Placeholder wrong answer A]",
      "[Placeholder wrong answer B]",
      "[Placeholder wrong answer C]",
    ],
    explanation: "[Placeholder explanation]",
  },
];

export const mockQuestions: QuestionWithAnswers[] = entries.map((e, i) => {
  const id = `q${i + 1}`;
  return {
    id,
    quizId: QUIZ_ID,
    text: e.text,
    difficulty: e.difficulty,
    approved: true,
    explanation: e.explanation,
    creditName: e.creditName ?? null,
    answers: e.answers.map((text, j) => ({
      id: `${id}-a${j + 1}`,
      questionId: id,
      text,
      isCorrect: j === 0,
    })),
  };
});
