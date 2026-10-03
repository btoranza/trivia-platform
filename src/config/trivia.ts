export type ResultTier = {
  /** Inclusive percentage range (0-100). */
  min: number;
  max: number;
  title: string;
  message: string;
};

export type CreditGroup = {
  role: string;
  names: readonly string[];
  /** If true, `names` is ignored and filled from the credit names of approved questions. */
  fromQuestions?: boolean;
};

export type TriviaConfig = {
  slug: string;
  title: string;
  description: string;
  /** Questions per game, or null to play every available question. */
  questionsPerGame: number | null;
  /** Ordered from easiest to hardest; each level includes the easier ones. */
  difficulties: readonly string[];
  /** Preselected on the Home screen; must be one of `difficulties`. */
  defaultDifficulty: string;
  labels: {
    sticker: string;
    start: string;
    submit: string;
    credit: string;
    next: string;
    seeResults: string;
    correct: string;
    wrong: string;
    resultsSuffix: string;
    youAreA: string;
    playAgain: string;
    share: string;
    copied: string;
    questionPrefix: string;
    back: string;
    home: string;
    credits: string;
    explanationRight: string;
    difficultyInfo: string;
    submittedBy: string;
    explanationWrong: string;
    chooseDifficulty: string;
    noQuestions: string;
  };
  form: {
    title: string;
    intro: string;
    question: string;
    correctAnswer: string;
    wrongAnswer: string;
    difficulty: string;
    explanation: string;
    explanationHint: string;
    codeHint: string;
    name: string;
    anonymous: string;
    submit: string;
    sending: string;
    successTitle: string;
    successMessage: string;
    submitAnother: string;
    errors: {
      required: string;
      tooLong: string;
      duplicateAnswers: string;
      generic: string;
    };
  };
  /** Placeholders: {score}, {total}, {title}, {tier}, {url}. */
  shareText: string;
  credits: readonly CreditGroup[];
  tiers: readonly ResultTier[];
};

export const triviaConfig = {
  slug: "frontend-trivia",
  title: "Frontend Trivia",
  description:
    "JavaScript, TypeScript, CSS and HTML. No Googling. (We can tell.)",
  questionsPerGame: null,
  difficulties: ["Easy", "Medium", "Hard"],
  defaultDifficulty: "Medium",
  labels: {
    sticker: "NO GOOGLING",
    start: "START QUIZ",
    submit: "Submit a question",
    credit: "made by Berenice",
    next: "NEXT",
    seeResults: "SEE RESULTS",
    correct: "CORRECT",
    wrong: "NOPE",
    resultsSuffix: "RESULTS",
    youAreA: "YOU ARE A",
    playAgain: "Play again",
    share: "SHARE",
    copied: "Copied!",
    questionPrefix: "Q",
    back: "Back home",
    home: "Home",
    credits: "Credits",
    explanationRight: "That's right!",
    difficultyInfo: "{count} questions · {levels}",
    submittedBy: "Submitted by",
    explanationWrong: "Did you know?",
    chooseDifficulty: "Difficulty",
    noQuestions: "No questions yet. Check back soon!",
  },
  credits: [
    { role: "Developer", names: ["Berenice"] },
    { role: "Questions submitted by", names: [], fromQuestions: true },
  ],
  form: {
    title: "Submit a question",
    intro:
      "Got a good one? Send it in. Questions are reviewed by hand before they show up in the quiz.",
    question: "Your question",
    correctAnswer: "Correct",
    wrongAnswer: "Wrong",
    difficulty: "Difficulty",
    explanation: "Explanation",
    explanationHint: "Shown after someone answers. Why is it the right answer?",
    codeHint: "Wrap code in `backticks`, like `typeof null`.",
    name: "Credit name (optional)",
    anonymous: "Stay anonymous",
    submit: "SEND QUESTION",
    sending: "SENDING...",
    successTitle: "Thanks!",
    successMessage:
      "Your question is waiting for review. If it gets approved, it will join the quiz.",
    submitAnother: "Submit another",
    errors: {
      required: "This field is required.",
      tooLong: "Too long.",
      duplicateAnswers: "Answers must be different from each other.",
      generic: "Something went wrong. Please try again.",
    },
  },
  shareText: "I got {score}/{total} on {title} — I'm a {tier}. {url}",
  tiers: [
    {
      min: 0,
      max: 20,
      title: "Console.log Debugger",
      message: "You print, you pray, you ship. It works on your machine.",
    },
    {
      min: 21,
      max: 50,
      title: "Stack Overflow Regular",
      message: "Not every answer is in your head, but you know where to look.",
    },
    {
      min: 51,
      max: 80,
      title: "Solid Frontend Dev",
      message: "You know your div from your span. Pull requests welcome.",
    },
    {
      min: 81,
      max: 99,
      title: "Senior Engineer",
      message:
        "Almost flawless. You have strong opinions about tabs vs spaces.",
    },
    {
      min: 100,
      max: 100,
      title: "Compiler",
      message: "Zero errors, zero warnings. Are you even human?",
    },
  ],
} satisfies TriviaConfig;
