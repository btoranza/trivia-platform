"use client";

import { useState } from "react";
import { triviaConfig as config } from "@/config/trivia";
import { buildGame, getTier } from "@/lib/quiz";
import type { QuestionWithAnswers } from "@/types/quiz";
import { AnswerOption, type AnswerState } from "./AnswerOption";
import { Button } from "./Button";
import { Card } from "./Card";
import { Chip } from "./Chip";
import { HomeLink } from "./HomeLink";
import { ProgressBar } from "./ProgressBar";
import { Results } from "./Results";
import { RichText } from "./RichText";

type Props = {
  /** Full question pool, used to reshuffle on "Play again". */
  questions: QuestionWithAnswers[];
  /** First game, shuffled on the server so SSR and client markup match. */
  initialGame: QuestionWithAnswers[];
  /** Dev shortcut: start on the results screen with this score. */
  debugScore?: number;
};

export function Quiz({ questions, initialGame, debugScore }: Props) {
  const [game, setGame] = useState(initialGame);
  const [index, setIndex] = useState(
    debugScore === undefined ? 0 : initialGame.length,
  );
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [score, setScore] = useState(debugScore ?? 0);

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
  const hasExplanation = revealed;
  const pickedCorrect = question.answers.some(
    (a) => a.id === pickedId && a.isCorrect,
  );

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
    <main className="mx-auto flex w-full flex-1 flex-col gap-5 md:max-w-2xl">
      <div>
        <HomeLink />
      </div>
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
        <div
          role="heading"
          aria-level={1}
          className="font-display text-[30px] leading-[1.05] md:text-[38px] tracking-tight"
        >
          <RichText text={question.text} />
        </div>
      </Card>
      <div
        className="grid grid-cols-1 gap-[14px] md:grid-cols-2"
        key={question.id}
      >
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
      <div className="flex-1 md:hidden" />
      <div className="flex min-h-16 items-center gap-4">
        {hasExplanation && (
          <div className="min-w-0 flex-1">
            <Card>
              <p className="text-xs font-bold uppercase tracking-wide">
                {pickedCorrect
                  ? config.labels.explanationRight
                  : config.labels.explanationWrong}
              </p>
              <p className="mt-1 text-sm font-medium">
                <RichText text={question.explanation} />
              </p>
              {question.creditName && (
                <p className="mt-2 text-xs font-bold">
                  {config.labels.submittedBy} {question.creditName}
                </p>
              )}
            </Card>
          </div>
        )}
        {revealed && (
          <div
            className={
              hasExplanation
                ? "w-32 shrink-0 md:w-48"
                : "w-full md:ml-auto md:w-72"
            }
          >
            <Button onClick={next} arrow={isLast ? undefined : "right"}>
              {isLast ? config.labels.seeResults : config.labels.next}
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
