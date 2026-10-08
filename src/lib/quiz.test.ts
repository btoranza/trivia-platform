import { describe, expect, it } from "vitest";
import { triviaConfig, type ResultTier } from "@/config/trivia";
import type { QuestionWithAnswers } from "@/types/quiz";
import {
  buildGame,
  filterByDifficulty,
  formatTemplate,
  gameForQuestion,
  getTier,
  rankResult,
  includedDifficulties,
  parseDifficulty,
  percentage,
  pickPhrase,
  shuffle,
} from "@/lib/quiz";

const difficulties = ["Easy", "Medium", "Hard"];

/** Deterministic "random" that cycles through the given values. */
const seq = (...values: number[]) => {
  let i = 0;
  return () => values[i++ % values.length];
};

const question = (id: string, difficulty: string): QuestionWithAnswers => ({
  id,
  quizId: "q",
  text: id,
  difficulty,
  approved: true,
  explanation: "",
  answers: [
    { id: `${id}-a`, questionId: id, text: "a", isCorrect: true },
    { id: `${id}-b`, questionId: id, text: "b", isCorrect: false },
    { id: `${id}-c`, questionId: id, text: "c", isCorrect: false },
  ],
});

describe("shuffle", () => {
  it("returns a new array with the same items and does not mutate the input", () => {
    const input = [1, 2, 3, 4, 5];
    const out = shuffle(input);
    expect(out).not.toBe(input);
    expect([...out].sort()).toEqual([1, 2, 3, 4, 5]);
    expect(input).toEqual([1, 2, 3, 4, 5]);
  });

  it("is deterministic for a given random source", () => {
    expect(shuffle([1, 2, 3, 4], seq(0, 0, 0))).toEqual(shuffle([1, 2, 3, 4], seq(0, 0, 0)));
    expect(shuffle([1, 2, 3], () => 0)).toEqual([2, 3, 1]);
  });

  it("handles empty and single-item arrays", () => {
    expect(shuffle([])).toEqual([]);
    expect(shuffle([1])).toEqual([1]);
  });
});

describe("buildGame", () => {
  const pool = ["1", "2", "3", "4", "5"].map((id) => question(id, "Easy"));

  it("picks `count` questions", () => {
    expect(buildGame(pool, 3)).toHaveLength(3);
  });

  it("uses every question when count is null or larger than the pool", () => {
    expect(buildGame(pool, null)).toHaveLength(5);
    expect(buildGame(pool, 99)).toHaveLength(5);
  });

  it("keeps each question's answers, shuffled", () => {
    for (const q of buildGame(pool, null)) {
      expect(q.answers.map((a) => a.id).sort()).toEqual(
        [`${q.id}-a`, `${q.id}-b`, `${q.id}-c`],
      );
    }
  });

  it("does not mutate the original questions", () => {
    const before = JSON.stringify(pool);
    buildGame(pool, null, () => 0);
    expect(JSON.stringify(pool)).toBe(before);
  });
});

describe("percentage", () => {
  it("rounds to the nearest integer", () => {
    expect(percentage(1, 3)).toBe(33);
    expect(percentage(2, 3)).toBe(67);
    expect(percentage(10, 10)).toBe(100);
  });

  it("is 0 when there are no questions", () => {
    expect(percentage(0, 0)).toBe(0);
  });
});

describe("getTier", () => {
  const tiers: ResultTier[] = [
    { min: 0, max: 49, title: "low", message: "" },
    { min: 50, max: 99, title: "mid", message: "" },
    { min: 100, max: 100, title: "top", message: "" },
  ];

  it("matches the inclusive range edges", () => {
    expect(getTier(tiers, 49, 100).title).toBe("low");
    expect(getTier(tiers, 50, 100).title).toBe("mid");
    expect(getTier(tiers, 99, 100).title).toBe("mid");
    expect(getTier(tiers, 100, 100).title).toBe("top");
  });

  it("treats zero questions as 0%", () => {
    expect(getTier(tiers, 0, 0).title).toBe("low");
  });

  it("falls back to the last tier when nothing matches", () => {
    const gap: ResultTier[] = [
      { min: 0, max: 10, title: "a", message: "" },
      { min: 90, max: 100, title: "b", message: "" },
    ];
    expect(getTier(gap, 5, 10).title).toBe("b");
  });
});

describe("tiers with a minimum game length", () => {
  const tiers: ResultTier[] = [
    { min: 0, max: 80, title: "low", message: "" },
    { min: 81, max: 99, title: "high", message: "", minQuestions: 15 },
    { min: 100, max: 100, title: "top", message: "", minQuestions: 30 },
  ];

  it("gives a short perfect game the best tier it is long enough for", () => {
    expect(getTier(tiers, 10, 10).title).toBe("low");
    expect(getTier(tiers, 20, 20).title).toBe("high");
    expect(getTier(tiers, 30, 30).title).toBe("top");
    expect(getTier(tiers, 54, 54).title).toBe("top");
  });

  it("reports the tier the short game missed", () => {
    expect(rankResult(tiers, 10, 10).locked?.title).toBe("top");
    expect(rankResult(tiers, 20, 20).locked?.title).toBe("top");
    expect(rankResult(tiers, 10, 10).tier.title).toBe("low");
  });

  it("reports nothing when the game was long enough", () => {
    expect(rankResult(tiers, 30, 30).locked).toBeNull();
    expect(rankResult(tiers, 5, 10).locked).toBeNull();
  });

  it("does not lock tiers without a minimum", () => {
    expect(getTier(tiers, 2, 2).title).toBe("low");
    expect(rankResult(tiers, 1, 1).locked?.title).toBe("top");
  });

  it("never drops below the first tier", () => {
    const strict: ResultTier[] = [
      { min: 0, max: 100, title: "only", message: "", minQuestions: 50 },
    ];
    expect(getTier(strict, 3, 3).title).toBe("only");
  });
});

describe("formatTemplate", () => {
  it("replaces known placeholders, including repeated ones", () => {
    expect(formatTemplate("{score}/{total} - {score}", { score: 3, total: 5 })).toBe("3/5 - 3");
  });

  it("leaves unknown placeholders untouched", () => {
    expect(formatTemplate("hi {name}", {})).toBe("hi {name}");
  });
});

describe("parseDifficulty", () => {
  it("returns allowed values and falls back otherwise", () => {
    expect(parseDifficulty("Hard", difficulties, "Easy")).toBe("Hard");
    expect(parseDifficulty("Nope", difficulties, "Easy")).toBe("Easy");
    expect(parseDifficulty(undefined, difficulties, "Easy")).toBe("Easy");
  });

  it("uses the first value of an array", () => {
    expect(parseDifficulty(["Medium", "Hard"], difficulties, "Easy")).toBe("Medium");
  });
});

describe("includedDifficulties", () => {
  it("is cumulative from the easiest level", () => {
    expect(includedDifficulties("Easy", difficulties)).toEqual(["Easy"]);
    expect(includedDifficulties("Medium", difficulties)).toEqual(["Easy", "Medium"]);
    expect(includedDifficulties("Hard", difficulties)).toEqual(difficulties);
  });

  it("includes nothing for an unknown level", () => {
    expect(includedDifficulties("Nope", difficulties)).toEqual([]);
  });
});

describe("filterByDifficulty", () => {
  const pool = [question("e", "Easy"), question("m", "Medium"), question("h", "Hard")];

  it("keeps questions at or below the chosen level", () => {
    expect(filterByDifficulty(pool, "Medium", difficulties).map((q) => q.id)).toEqual(["e", "m"]);
  });

  it("falls back to the full pool when nothing matches", () => {
    const onlyHard = [question("h", "Hard")];
    expect(filterByDifficulty(onlyHard, "Easy", difficulties)).toHaveLength(1);
    expect(filterByDifficulty(pool, "Nope", difficulties)).toHaveLength(3);
  });
});

describe("pickPhrase", () => {
  it("picks from the options", () => {
    expect(pickPhrase(["a", "b", "c"], undefined, () => 0.5)).toBe("b");
  });

  it("never repeats the previous phrase", () => {
    for (const r of [0, 0.4, 0.99]) {
      expect(pickPhrase(["a", "b", "c"], "b", () => r)).not.toBe("b");
    }
  });

  it("returns the only option even if it was the previous one", () => {
    expect(pickPhrase(["a"], "a")).toBe("a");
  });

  it("returns an empty string for an empty list", () => {
    expect(pickPhrase([])).toBe("");
  });
});

describe("gameForQuestion", () => {
  const pool = ["1", "2", "3"].map((id) => question(id, "Easy"));

  it("returns a one-question game with shuffled answers", () => {
    const game = gameForQuestion(pool, "2");
    expect(game).toHaveLength(1);
    expect(game![0].id).toBe("2");
    expect(game![0].answers.map((a) => a.id).sort()).toEqual([
      "2-a",
      "2-b",
      "2-c",
    ]);
  });

  it("returns null for an unknown id", () => {
    expect(gameForQuestion(pool, "nope")).toBeNull();
  });
});

describe("the configured result tiers", () => {
  const tiers = triviaConfig.tiers;

  it("start at 0 and end at 100", () => {
    expect(tiers[0].min).toBe(0);
    expect(tiers[tiers.length - 1].max).toBe(100);
  });

  it("follow each other with no gaps or overlaps", () => {
    for (let i = 1; i < tiers.length; i++) {
      expect(tiers[i].min).toBe(tiers[i - 1].max + 1);
    }
  });

  it("give every percentage from 0 to 100 exactly one tier", () => {
    for (let pct = 0; pct <= 100; pct++) {
      const matches = tiers.filter((t) => pct >= t.min && pct <= t.max);
      expect(matches).toHaveLength(1);
    }
  });
});
