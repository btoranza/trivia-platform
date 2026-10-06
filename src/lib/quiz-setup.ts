import type { TriviaConfig } from "@/config/trivia";
import type { QuestionWithAnswers } from "@/types/quiz";
import { filterByDifficulty, parseDifficulty } from "@/lib/quiz";

type SetupConfig = Pick<
  TriviaConfig,
  "difficulties" | "defaultDifficulty" | "questionsPerGame"
> & { random: Pick<TriviaConfig["random"], "lengths" | "defaultLength"> };

/** How the game is built: by difficulty level, or random across every level. */
export type QuizSetup = {
  random: boolean;
  difficulty: string;
  /** Questions to play; null means every question in the pool. */
  length: number | null;
};

type Params = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

/** "all", or one of the allowed lengths; anything else gives the fallback. */
export function parseLength(
  value: string | string[] | undefined,
  allowed: readonly number[],
  fallback: number | null,
): number | null {
  const v = first(value);
  if (v === "all") return null;
  if (v && /^\d{1,4}$/.test(v) && allowed.includes(Number(v))) return Number(v);
  return fallback;
}

/** Reads `mode`, `difficulty` and `count` from the query string. */
export function parseSetup(params: Params, config: SetupConfig): QuizSetup {
  const random = first(params.mode) === "random";
  return {
    random,
    difficulty: parseDifficulty(
      params.difficulty,
      config.difficulties,
      config.defaultDifficulty,
    ),
    length: random
      ? parseLength(
          params.count,
          config.random.lengths,
          config.random.defaultLength,
        )
      : config.questionsPerGame,
  };
}

/** The questions a game is drawn from: every one in random mode. */
export function poolFor(
  questions: readonly QuestionWithAnswers[],
  setup: QuizSetup,
  difficulties: readonly string[],
): QuestionWithAnswers[] {
  return setup.random
    ? [...questions]
    : filterByDifficulty(questions, setup.difficulty, difficulties);
}

export function lengthParam(length: number | null): string {
  return length === null ? "all" : String(length);
}

/** Home address for random mode; keeps the level so "Levels" can go back to it. */
export function randomHomeHref(
  difficulty: string,
  length: number | null,
): string {
  return `/?mode=random&count=${lengthParam(length)}&difficulty=${encodeURIComponent(difficulty)}`;
}

/** Home address for a level (leaves random mode). */
export function levelHomeHref(difficulty: string): string {
  return `/?difficulty=${encodeURIComponent(difficulty)}`;
}

/** Query string that rebuilds this setup (without the leading "?"). */
export function setupQuery(setup: QuizSetup): string {
  return setup.random
    ? `mode=random&count=${lengthParam(setup.length)}`
    : `difficulty=${encodeURIComponent(setup.difficulty)}`;
}
