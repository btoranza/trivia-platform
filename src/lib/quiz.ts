import type { ResultTier } from "@/config/trivia";
import type { QuestionWithAnswers } from "@/types/quiz";

/** Fisher-Yates; returns a new array. */
export function shuffle<T>(items: readonly T[], random = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Pick `count` shuffled questions, each with shuffled answers. */
export function buildGame(
  questions: readonly QuestionWithAnswers[],
  count: number,
  random = Math.random,
): QuestionWithAnswers[] {
  return shuffle(questions, random)
    .slice(0, count)
    .map((q) => ({ ...q, answers: shuffle(q.answers, random) }));
}

export function percentage(score: number, total: number): number {
  return total === 0 ? 0 : Math.round((score / total) * 100);
}

export function getTier(
  tiers: readonly ResultTier[],
  score: number,
  total: number,
): ResultTier {
  const pct = percentage(score, total);
  return (
    tiers.find((t) => pct >= t.min && pct <= t.max) ??
    tiers[tiers.length - 1]
  );
}

export function formatShareText(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (m, key) =>
    key in values ? String(values[key]) : m,
  );
}

/** Returns the difficulty if it is one of the allowed ones, otherwise null (random). */
export function parseDifficulty(
  value: string | string[] | undefined,
  allowed: readonly string[],
): string | null {
  const v = Array.isArray(value) ? value[0] : value;
  return v && allowed.includes(v) ? v : null;
}

/**
 * Questions of the chosen difficulty, or all of them for random (null).
 * Falls back to the full pool if that difficulty has no questions.
 */
export function filterByDifficulty(
  questions: readonly QuestionWithAnswers[],
  difficulty: string | null,
): QuestionWithAnswers[] {
  if (difficulty === null) return [...questions];
  const matching = questions.filter((q) => q.difficulty === difficulty);
  return matching.length > 0 ? matching : [...questions];
}
