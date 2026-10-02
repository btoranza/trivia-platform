export type ResultTier = {
  /** Inclusive percentage range (0-100). */
  min: number;
  max: number;
  title: string;
  message: string;
};

export type TriviaConfig = {
  slug: string;
  title: string;
  description: string;
  questionsPerGame: number;
  /** Ordered from easiest to hardest; each level includes the easier ones. */
  difficulties: readonly string[];
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
    submitTitle: string;
    submitPlaceholder: string;
    back: string;
    home: string;
    explanationRight: string;
    difficultyInfo: string;
    difficultyInfoRandom: string;
    submittedBy: string;
    explanationWrong: string;
    chooseDifficulty: string;
    randomDifficulty: string;
  };
  /** Placeholders: {score}, {total}, {title}, {tier}, {url}. */
  shareText: string;
  tiers: readonly ResultTier[];
};

export const triviaConfig = {
  slug: "danielle-trivia",
  title: "Danielle Trivia",
  description:
    "How well do you know the community? Ten questions. No pressure. (Some pressure.)",
  questionsPerGame: 10,
  difficulties: ["Easy", "Medium", "Hard"],
  labels: {
    sticker: "A STUPID IDEA",
    start: "START QUIZ →",
    submit: "Submit a question",
    credit: "made by Walnuts",
    next: "NEXT →",
    seeResults: "SEE RESULTS",
    correct: "CORRECT",
    wrong: "NOPE",
    resultsSuffix: "RESULTS",
    youAreA: "YOU ARE A",
    playAgain: "Play again",
    share: "SHARE",
    copied: "Copied!",
    questionPrefix: "Q",
    submitTitle: "Submit a question",
    submitPlaceholder: "The submission form is coming soon.",
    back: "← Back home",
    home: "← Home",
    explanationRight: "That's right!",
    difficultyInfo: "{count} questions · {levels}",
    difficultyInfoRandom: "{count} questions · mixed difficulties",
    submittedBy: "Submitted by",
    explanationWrong: "Did you know?",
    chooseDifficulty: "Difficulty",
    randomDifficulty: "Random",
  },
  shareText: "I got {score}/{total} on {title} — I'm a {tier}. {url}",
  tiers: [
    {
      min: 0,
      max: 20,
      title: "Casual Observer",
      message: "You wandered in, looked around, and left with snacks. Respect.",
    },
    {
      min: 21,
      max: 50,
      title: "Walnut",
      message: "Hard shell, some substance. You belong here.",
    },
    {
      min: 51,
      max: 80,
      title: "Dedicated Walnut",
      message: "You show up, you pay attention, you have opinions.",
    },
    {
      min: 81,
      max: 99,
      title: "Veteran Walnut",
      message: "Almost flawless. The community salutes you.",
    },
    {
      min: 100,
      max: 100,
      title: "You need to touch grass",
      message:
        "Perfect score. Please go outside. We are worried and impressed.",
    },
  ],
} satisfies TriviaConfig;
