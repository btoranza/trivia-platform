import { connection } from "next/server";
import { Quiz } from "@/components/Quiz";
import { triviaConfig as config } from "@/config/trivia";
import { getQuestions } from "@/lib/questions";
import { buildGame, filterByDifficulty, parseDifficulty } from "@/lib/quiz";

export default async function QuizPage({ searchParams }: PageProps<"/quiz">) {
  // Opt out of static prerendering so each visit gets a fresh shuffle.
  await connection();
  const difficulty = parseDifficulty(
    (await searchParams).difficulty,
    config.difficulties,
  );
  const pool = filterByDifficulty(await getQuestions(config.slug), difficulty);
  return (
    <Quiz
      questions={pool}
      initialGame={buildGame(pool, config.questionsPerGame)}
    />
  );
}
