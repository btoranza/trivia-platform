import { connection } from "next/server";
import { Card } from "@/components/Card";
import { HomeLink } from "@/components/HomeLink";
import { Quiz } from "@/components/Quiz";
import { triviaConfig as config } from "@/config/trivia";
import { getQuestions } from "@/lib/questions";
import { buildGame, filterByDifficulty, parseDifficulty } from "@/lib/quiz";

export default async function QuizPage({ searchParams }: PageProps<"/quiz">) {
  // Opt out of static prerendering so each visit gets a fresh shuffle.
  await connection();
  const params = await searchParams;
  const difficulty = parseDifficulty(
    params.difficulty,
    config.difficulties,
    config.defaultDifficulty,
  );
  const pool = filterByDifficulty(
    await getQuestions(config.slug),
    difficulty,
    config.difficulties,
  );
  if (pool.length === 0) {
    return (
      <main className="mx-auto flex w-full flex-1 flex-col gap-6 md:max-w-2xl">
        <div>
          <HomeLink />
        </div>
        <Card>
          <p className="text-lg font-bold">{config.labels.noQuestions}</p>
        </Card>
      </main>
    );
  }
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
