import { connection } from "next/server";
import { Quiz } from "@/components/Quiz";
import { triviaConfig as config } from "@/config/trivia";
import { getQuestions } from "@/lib/questions";
import { buildGame, filterByDifficulty, parseDifficulty } from "@/lib/quiz";

export default async function QuizPage({ searchParams }: PageProps<"/quiz">) {
  // Opt out of static prerendering so each visit gets a fresh shuffle.
  await connection();
  const params = await searchParams;
  const difficulty = parseDifficulty(params.difficulty, config.difficulties);
  const pool = filterByDifficulty(
    await getQuestions(config.slug),
    difficulty,
    config.difficulties,
  );
  const initialGame = buildGame(pool, config.questionsPerGame);
  // Dev-only shortcut: /quiz?score=8 jumps straight to the results screen.
  const debugScore =
    process.env.NODE_ENV === "development" && typeof params.score === "string"
      ? Math.min(initialGame.length, Math.max(0, Number(params.score) || 0))
      : undefined;
  return (
    <Quiz questions={pool} initialGame={initialGame} debugScore={debugScore} />
  );
}
