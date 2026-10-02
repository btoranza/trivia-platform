import { connection } from "next/server";
import { Quiz } from "@/components/Quiz";
import { triviaConfig as config } from "@/config/trivia";
import { getQuestions } from "@/lib/questions";
import { buildGame } from "@/lib/quiz";

export default async function QuizPage() {
  // Opt out of static prerendering so each visit gets a fresh shuffle.
  await connection();
  const questions = await getQuestions(config.slug);
  return (
    <Quiz
      questions={questions}
      initialGame={buildGame(questions, config.questionsPerGame)}
    />
  );
}
