import { describe, expect, it } from "vitest";
import { triviaConfig } from "@/config/trivia";
import { summarizePlays, validatePlay, type StoredPlay } from "@/lib/plays";

const difficulties = ["Easy", "Medium", "Hard"];
const valid = { score: 7, total: 10, random: false, difficulty: "Hard" };

describe("validatePlay", () => {
  it("accepts a level game", () => {
    expect(validatePlay(valid, difficulties)).toEqual(valid);
  });

  it("accepts a random game and stores no level for it", () => {
    expect(
      validatePlay(
        { ...valid, random: true, difficulty: "Hard" },
        difficulties,
      ),
    ).toEqual({ score: 7, total: 10, random: true, difficulty: null });
  });

  it("accepts a score of zero and a perfect score", () => {
    expect(validatePlay({ ...valid, score: 0 }, difficulties)).not.toBeNull();
    expect(validatePlay({ ...valid, score: 10 }, difficulties)).not.toBeNull();
  });

  it("rejects anything that is not an object", () => {
    for (const bad of [null, undefined, "x", 5, []]) {
      expect(validatePlay(bad, difficulties)).toBeNull();
    }
  });

  it("rejects scores that make no sense", () => {
    for (const bad of [
      { ...valid, score: 11 },
      { ...valid, score: -1 },
      { ...valid, score: 1.5 },
      { ...valid, score: "7" },
      { ...valid, total: 0 },
      { ...valid, total: 501, score: 1 },
    ]) {
      expect(validatePlay(bad, difficulties)).toBeNull();
    }
  });

  it("rejects an unknown level in a level game", () => {
    expect(
      validatePlay({ ...valid, difficulty: "Nightmare" }, difficulties),
    ).toBeNull();
    expect(
      validatePlay({ ...valid, difficulty: undefined }, difficulties),
    ).toBeNull();
  });

  it("rejects a mode that is not a boolean", () => {
    expect(validatePlay({ ...valid, random: "yes" }, difficulties)).toBeNull();
  });
});

describe("summarizePlays", () => {
  const now = new Date("2026-10-06T12:00:00Z");
  const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600_000);
  const play = (
    score: number,
    total: number,
    random: boolean,
    difficulty: string | null,
    h: number,
  ): StoredPlay => ({
    score,
    total,
    random,
    difficulty,
    createdAt: hoursAgo(h),
  });

  const tiers = triviaConfig.tiers;

  it("handles no games at all", () => {
    const s = summarizePlays([], tiers, difficulties, now);
    expect(s.total).toBe(0);
    expect(s.averagePercent).toBeNull();
    expect(s.last24h).toBe(0);
    expect(s.byTier.every((t) => t.count === 0)).toBe(true);
  });

  it("counts games by time window", () => {
    const s = summarizePlays(
      [
        play(5, 10, false, "Easy", 1),
        play(5, 10, false, "Easy", 30),
        play(5, 10, false, "Easy", 24 * 8),
      ],
      tiers,
      difficulties,
      now,
    );
    expect(s.total).toBe(3);
    expect(s.last24h).toBe(1);
    expect(s.last7d).toBe(2);
  });

  it("averages each game's percentage", () => {
    const s = summarizePlays(
      [play(10, 10, false, "Easy", 1), play(0, 10, false, "Easy", 1)],
      tiers,
      difficulties,
      now,
    );
    expect(s.averagePercent).toBe(50);
  });

  it("splits level and random games, and levels by difficulty", () => {
    const s = summarizePlays(
      [
        play(5, 10, true, null, 1),
        play(5, 10, false, "Hard", 1),
        play(5, 10, false, "Hard", 1),
        play(5, 10, false, "Easy", 1),
      ],
      tiers,
      difficulties,
      now,
    );
    expect(s.random).toBe(1);
    expect(s.levels).toBe(3);
    expect(s.byDifficulty).toEqual([
      { difficulty: "Easy", count: 1 },
      { difficulty: "Medium", count: 0 },
      { difficulty: "Hard", count: 2 },
    ]);
  });

  it("counts games per rank, in the order of the ranks", () => {
    const lowest = tiers[0].title;
    const highest = tiers[tiers.length - 1].title;
    const s = summarizePlays(
      [
        play(30, 30, false, "Hard", 1),
        play(30, 30, true, null, 1),
        play(0, 10, true, null, 1),
      ],
      tiers,
      difficulties,
      now,
    );
    expect(s.byTier.map((t) => t.title)).toEqual(tiers.map((t) => t.title));
    expect(s.byTier.find((t) => t.title === highest)?.count).toBe(2);
    expect(s.byTier.find((t) => t.title === lowest)?.count).toBe(1);
    expect(s.byTier.reduce((n, t) => n + t.count, 0)).toBe(3);
  });
});
