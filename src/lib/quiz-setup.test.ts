import { describe, expect, it } from "vitest";
import { triviaConfig } from "@/config/trivia";
import {
  lengthParam,
  levelHomeHref,
  parseLength,
  parseSetup,
  poolFor,
  randomHomeHref,
  setupQuery,
} from "@/lib/quiz-setup";
import type { QuestionWithAnswers } from "@/types/quiz";

const question = (id: string, difficulty: string): QuestionWithAnswers => ({
  id,
  quizId: "q",
  text: id,
  difficulty,
  approved: true,
  explanation: "",
  creditName: null,
  answers: [{ id: `${id}-a`, questionId: id, text: "a", isCorrect: true }],
});

const questions = [
  question("e1", "Easy"),
  question("e2", "Easy"),
  question("m1", "Medium"),
  question("h1", "Hard"),
];

const config = {
  difficulties: ["Easy", "Medium", "Hard"],
  defaultDifficulty: "Medium",
  questionsPerGame: null,
  random: {
    label: "Random",
    lengthLabel: "Questions",
    allLabel: "All",
    lengths: [10, 20, 30],
    defaultLength: 20,
    info: "{count}",
  },
};

describe("parseLength", () => {
  it("accepts the offered lengths", () => {
    expect(parseLength("10", [10, 20, 30], 20)).toBe(10);
    expect(parseLength("30", [10, 20, 30], 20)).toBe(30);
  });

  it("reads 'all' as no limit", () => {
    expect(parseLength("all", [10, 20, 30], 20)).toBeNull();
  });

  it("falls back for anything else", () => {
    for (const bad of ["15", "0", "-5", "abc", "", "1e3", "10.5", undefined]) {
      expect(parseLength(bad, [10, 20, 30], 20)).toBe(20);
    }
  });

  it("uses the first value when it is repeated", () => {
    expect(parseLength(["10", "30"], [10, 20, 30], 20)).toBe(10);
  });
});

describe("parseSetup", () => {
  it("defaults to the difficulty mode with the configured level", () => {
    expect(parseSetup({}, config)).toEqual({
      random: false,
      difficulty: "Medium",
      length: null,
    });
  });

  it("reads the chosen difficulty", () => {
    expect(parseSetup({ difficulty: "Hard" }, config).difficulty).toBe("Hard");
  });

  it("enters random mode with the chosen length", () => {
    expect(parseSetup({ mode: "random", count: "10" }, config)).toMatchObject({
      random: true,
      length: 10,
    });
  });

  it("uses the default length in random mode when none is given", () => {
    expect(parseSetup({ mode: "random" }, config).length).toBe(20);
  });

  it("plays everything in random mode with count=all", () => {
    expect(
      parseSetup({ mode: "random", count: "all" }, config).length,
    ).toBeNull();
  });

  it("ignores count when not in random mode", () => {
    expect(parseSetup({ count: "10" }, config).length).toBeNull();
  });

  it("treats an unknown mode as the difficulty mode", () => {
    expect(parseSetup({ mode: "chaos" }, config).random).toBe(false);
  });
});

describe("poolFor", () => {
  it("is cumulative by level in the difficulty mode", () => {
    const setup = parseSetup({ difficulty: "Medium" }, config);
    expect(
      poolFor(questions, setup, config.difficulties).map((q) => q.id),
    ).toEqual(["e1", "e2", "m1"]);
  });

  it("is every question in random mode, whatever the difficulty", () => {
    const setup = parseSetup({ mode: "random", difficulty: "Easy" }, config);
    expect(poolFor(questions, setup, config.difficulties)).toHaveLength(4);
  });
});

describe("setupQuery and lengthParam", () => {
  it("builds the address for each mode", () => {
    expect(setupQuery(parseSetup({ difficulty: "Hard" }, config))).toBe(
      "difficulty=Hard",
    );
    expect(
      setupQuery(parseSetup({ mode: "random", count: "30" }, config)),
    ).toBe("mode=random&count=30");
    expect(
      setupQuery(parseSetup({ mode: "random", count: "all" }, config)),
    ).toBe("mode=random&count=all");
  });

  it("writes 'all' for no limit", () => {
    expect(lengthParam(null)).toBe("all");
    expect(lengthParam(10)).toBe("10");
  });
});

describe("home addresses that remember the level", () => {
  it("keeps the level when opening random mode or changing its length", () => {
    expect(randomHomeHref("Hard", 20)).toBe(
      "/?mode=random&count=20&difficulty=Hard",
    );
    expect(randomHomeHref("Easy", null)).toBe(
      "/?mode=random&count=all&difficulty=Easy",
    );
  });

  it("goes back to the level, leaving random mode", () => {
    expect(levelHomeHref("Hard")).toBe("/?difficulty=Hard");
  });

  it("round-trips: random mode remembers the level it came from", () => {
    const params = new URLSearchParams(randomHomeHref("Hard", 30).slice(2));
    const setup = parseSetup(Object.fromEntries(params), config);
    expect(setup).toEqual({ random: true, difficulty: "Hard", length: 30 });
    expect(levelHomeHref(setup.difficulty)).toBe("/?difficulty=Hard");
  });
});

describe("the configured random mode", () => {
  it("offers a default length that is one of the choices", () => {
    expect(triviaConfig.random.lengths).toContain(
      triviaConfig.random.defaultLength,
    );
  });
});
