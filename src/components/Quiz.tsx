"use client";

import { useState } from "react";
import { triviaConfig as config } from "@/config/trivia";
import { buildGame, getTier } from "@/lib/quiz";
import type { QuestionWithAnswers } from "@/types/quiz";
import { AnswerOption, type AnswerState } from "./AnswerOption";
import { Button } from "./Button";
import { Card } from "./Card";
import { Chip } from "./Chip";
import { ProgressBar } from "./ProgressBar";
import { Results } from "./Results";

type Props = {
  /** Full question pool, used to reshuffle on "Play again". */
  questions: QuestionWithAnswers[];
  /** First game, shuffled on the server so SSR and client markup match. */
  initialGame: QuestionWithAnswers[];
};

export function Quiz({ questions, initialGame }: Props) {
  const [game, setGame] = useState(initialGame);
  const [index, setIndex] = useState(0);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const total = game.length;
  const finished = index >= total;

  function restart() {
    setGame(buildGame(questions, config.questionsPerGame));
    setIndex(0);
    setPickedId(null);
    setScore(0);
  }

  if (finished) {
    return (
      <Results
        score={score}
        total={total}
        tier={getTier(config.tiers, score, total)}
        onRestart={restart}
      />
    );
  }

  const question = game[index];
  const revealed = pickedId !== null;
  const isLast = index === total - 1;

  function select(answerId: string, isCorrect: boolean) {
    setPickedId(answerId);
    if (isCorrect) setScore((s) => s + 1);
  }

  function next() {
    setIndex((i) => i + 1);
    setPickedId(null);
  }

  function stateOf(answerId: string, isCorrect: boolean): AnswerState {
    if (!revealed) return "default";
    if (isCorrect) return "correct";
    if (answerId === pickedId) return "wrong";
    return "idle";
  }

  return (
    <main className="flex flex-1 flex-col gap-5">
      <div className="flex items-center justify-between">
        <Chip>
          {config.labels.questionPrefix} {index + 1}/{total}
        </Chip>
        <Chip variant="inverted">{question.difficulty}</Chip>
      </div>
      <ProgressBar
        value={(index + (revealed ? 1 : 0)) / total}
        label={`${config.labels.questionPrefix} ${index + 1}/${total}`}
      />
      <Card>
        <h1 className="font-display text-[30px] leading-[1.05] tracking-tight">
          {question.text}
        </h1>
      </Card>
      <div className="flex flex-col gap-[14px]" key={question.id}>
        {question.answers.map((a) => (
          <AnswerOption
            key={a.id}
            text={a.text}
            state={stateOf(a.id, a.isCorrect)}
            locked={revealed}
            selected={a.id === pickedId}
            correctLabel={config.labels.correct}
            wrongLabel={config.labels.wrong}
            onSelect={() => select(a.id, a.isCorrect)}
          />
        ))}
      </div>
      <div className="flex-1" />
      <div className="min-h-16">
        {revealed && (
          <Button onClick={next}>
            {isLast ? config.labels.seeResults : config.labels.next}
          </Button>
        )}
      </div>
    </main>
  );
}
