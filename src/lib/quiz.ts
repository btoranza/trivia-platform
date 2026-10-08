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

/** Pick `count` shuffled questions (all of them if null), each with shuffled answers. */
export function buildGame(
  questions: readonly QuestionWithAnswers[],
  count: number | null,
  random = Math.random,
): QuestionWithAnswers[] {
  return shuffle(questions, random)
    .slice(0, count ?? undefined)
    .map((q) => ({ ...q, answers: shuffle(q.answers, random) }));
}

/** A one-question game for the question with this id, or null if there is none. */
export function gameForQuestion(
  questions: readonly QuestionWithAnswers[],
  id: string,
  random = Math.random,
): QuestionWithAnswers[] | null {
  const found = questions.find((q) => q.id === id);
  return found ? buildGame([found], 1, random) : null;
}

export function percentage(score: number, total: number): number {
  return total === 0 ? 0 : Math.round((score / total) * 100);
}

/**
 * The tier a score earns. The percentage picks it, but a tier with a
 * `minQuestions` needs a long enough game: a short one gets the best tier
 * below it. `locked` is the tier the percentage alone would have given, when
 * the game was too short for it.
 */
export function rankResult(
  tiers: readonly ResultTier[],
  score: number,
  total: number,
): { tier: ResultTier; locked: ResultTier | null } {
  const pct = percentage(score, total);
  const found = tiers.findIndex((t) => pct >= t.min && pct <= t.max);
  const byPercent = found === -1 ? tiers.length - 1 : found;
  let earned = byPercent;
  while (earned > 0 && total < (tiers[earned].minQuestions ?? 0)) earned--;
  return {
    tier: tiers[earned],
    locked: earned === byPercent ? null : tiers[byPercent],
  };
}

export function getTier(
  tiers: readonly ResultTier[],
  score: number,
  total: number,
): ResultTier {
  return rankResult(tiers, score, total).tier;
}

export function formatTemplate(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (m, key) =>
    key in values ? String(values[key]) : m,
  );
}

/** Returns the difficulty if it is one of the allowed ones, otherwise the fallback. */
export function parseDifficulty(
  value: string | string[] | undefined,
  allowed: readonly string[],
  fallback: string,
): string {
  const v = Array.isArray(value) ? value[0] : value;
  return v && allowed.includes(v) ? v : fallback;
}

/**
 * Difficulties included when playing at `difficulty`. Levels are cumulative:
 * the order of `difficulties` is easiest to hardest, and a level includes
 * itself and every easier one.
 */
export function includedDifficulties(
  difficulty: string,
  difficulties: readonly string[],
): string[] {
  return difficulties.slice(0, difficulties.indexOf(difficulty) + 1);
}

/**
 * Questions allowed at the chosen difficulty (see includedDifficulties).
 * Falls back to the full pool if none match.
 */
export function filterByDifficulty(
  questions: readonly QuestionWithAnswers[],
  difficulty: string,
  difficulties: readonly string[],
): QuestionWithAnswers[] {
  const included = includedDifficulties(difficulty, difficulties);
  const matching = questions.filter((q) => included.includes(q.difficulty));
  return matching.length > 0 ? matching : [...questions];
}

/**
 * Picks a random phrase, avoiding `previous` so the same one never shows twice
 * in a row (unless it is the only option).
 */
export function pickPhrase(
  options: readonly string[],
  previous?: string,
  random = Math.random,
): string {
  const candidates =
    options.length > 1 ? options.filter((o) => o !== previous) : options;
  if (candidates.length === 0) return "";
  return candidates[Math.floor(random() * candidates.length)];
}
