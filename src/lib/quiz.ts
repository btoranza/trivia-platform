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
