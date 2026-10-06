import type { ResultTier } from "@/config/trivia";
import { getTier, percentage } from "@/lib/quiz";

export const MAX_PLAY_TOTAL = 500;

/** What the browser reports when a game ends. */
export type PlayInput = {
  score: number;
  total: number;
  random: boolean;
  difficulty: string;
};

export type PlayData = {
  score: number;
  total: number;
  random: boolean;
  /** The level of a level game; null in random mode. */
  difficulty: string | null;
};

/**
 * Checks what the browser sent before it is stored. Only sane results are
 * kept, so the endpoint cannot be used to save arbitrary data.
 */
export function validatePlay(
  input: unknown,
  difficulties: readonly string[],
): PlayData | null {
  if (typeof input !== "object" || input === null) return null;
  const { score, total, random, difficulty } = input as Record<string, unknown>;

  if (!Number.isInteger(score) || !Number.isInteger(total)) return null;
  const s = score as number;
  const t = total as number;
  if (t < 1 || t > MAX_PLAY_TOTAL || s < 0 || s > t) return null;
  if (typeof random !== "boolean") return null;

  if (random) return { score: s, total: t, random: true, difficulty: null };
  if (typeof difficulty !== "string" || !difficulties.includes(difficulty)) {
    return null;
  }
  return { score: s, total: t, random: false, difficulty };
}

export type StoredPlay = PlayData & { createdAt: Date };

export type PlayStats = {
  total: number;
  last24h: number;
  last7d: number;
  /** Average of each game's percentage, or null with no games. */
  averagePercent: number | null;
  random: number;
  levels: number;
  /** Level games per difficulty, in the order given. */
  byDifficulty: { difficulty: string; count: number }[];
  /** Games per result tier, in the order of the tiers. */
  byTier: { title: string; count: number }[];
};

const DAY = 24 * 60 * 60 * 1000;

/** Turns the stored games into the numbers shown in /admin. */
export function summarizePlays(
  plays: readonly StoredPlay[],
  tiers: readonly ResultTier[],
  difficulties: readonly string[],
  now = new Date(),
): PlayStats {
  const since = (ms: number) =>
    plays.filter((p) => now.getTime() - p.createdAt.getTime() < ms).length;

  const tierCounts = new Map(tiers.map((t) => [t.title, 0]));
  const difficultyCounts = new Map(difficulties.map((d) => [d, 0]));
  let percentSum = 0;
  let random = 0;

  for (const p of plays) {
    percentSum += percentage(p.score, p.total);
    const title = getTier(tiers, p.score, p.total).title;
    tierCounts.set(title, (tierCounts.get(title) ?? 0) + 1);
    if (p.random) random++;
    else if (p.difficulty && difficultyCounts.has(p.difficulty)) {
      difficultyCounts.set(
        p.difficulty,
        difficultyCounts.get(p.difficulty)! + 1,
      );
    }
  }

  return {
    total: plays.length,
    last24h: since(DAY),
    last7d: since(7 * DAY),
    averagePercent:
      plays.length === 0 ? null : Math.round(percentSum / plays.length),
    random,
    levels: plays.length - random,
    byDifficulty: [...difficultyCounts].map(([difficulty, count]) => ({
      difficulty,
      count,
    })),
    byTier: [...tierCounts].map(([title, count]) => ({ title, count })),
  };
}
