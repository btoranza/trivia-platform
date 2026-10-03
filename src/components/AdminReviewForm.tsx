"use client";

import { useActionState, useState } from "react";
import { reviewSubmission, type ReviewState } from "@/app/admin/actions";
import { triviaConfig as config } from "@/config/trivia";
import { LIMITS } from "@/lib/submissions";
import { AlertIcon } from "./AlertIcon";
import { Button } from "./Button";
import { Chip } from "./Chip";
import { RichText } from "./RichText";

type Props = {
  id: string;
  createdAt: string;
  creditName: string | null;
  initial: {
    text: string;
    difficulty: string;
    /** First answer is the correct one. */
    answers: string[];
    explanation: string;
  };
};

const input =
  "border-brutal w-full bg-surface px-3 py-2 text-base font-medium text-ink";
const label = "text-xs font-bold uppercase tracking-wide";

export function AdminReviewForm({ id, createdAt, creditName, initial }: Props) {
  const [state, action, pending] = useActionState<ReviewState, FormData>(
    reviewSubmission.bind(null, id),
    { errors: {} },
  );
  const [text, setText] = useState(initial.text);
  const [answers, setAnswers] = useState(initial.answers);
  const [explanation, setExplanation] = useState(initial.explanation);
  const [difficulty, setDifficulty] = useState(initial.difficulty);
  const { errors } = state;

  return (
    <form action={action} className="grid gap-6 md:grid-cols-2">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Chip>{creditName ?? "Anonymous"}</Chip>
          <span className="text-xs font-bold">{createdAt}</span>
        </div>

        <div>
          <label htmlFor={`${id}-text`} className={label}>
            {config.form.question}
          </label>
          <textarea
            id={`${id}-text`}
            name="text"
            rows={3}
            maxLength={LIMITS.question}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className={`${input} mt-1 resize-y`}
          />
          {errors.text && <Error message={errors.text} />}
        </div>

        {answers.map((answer, i) => (
          <div key={i}>
            <label htmlFor={`${id}-a${i}`} className={label}>
              {i === 0 ? config.form.correctAnswer : config.form.wrongAnswer}
            </label>
            <input
              id={`${id}-a${i}`}
              name={`answer-${i}`}
              type="text"
              maxLength={LIMITS.answer}
              value={answer}
              onChange={(e) =>
                setAnswers(
                  answers.map((a, j) => (j === i ? e.target.value : a)),
                )
              }
              className={`${input} mt-1 ${i === 0 ? "bg-correct" : ""}`}
            />
          </div>
        ))}
        {errors.answers && <Error message={errors.answers} />}

        <div>
          <label htmlFor={`${id}-explanation`} className={label}>
            {config.form.explanation}
          </label>
          <textarea
            id={`${id}-explanation`}
            name="explanation"
            rows={3}
            maxLength={LIMITS.explanation}
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            className={`${input} mt-1 resize-y`}
          />
          {errors.explanation && <Error message={errors.explanation} />}
        </div>

        <div>
          <label htmlFor={`${id}-difficulty`} className={label}>
            {config.form.difficulty}
          </label>
          <select
            id={`${id}-difficulty`}
            name="difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className={`${input} mt-1`}
          >
            {config.difficulties.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <p className={label}>Preview</p>
        <div className="border-brutal bg-canvas p-4">
          <div className="mb-3">
            <Chip variant="inverted">{difficulty}</Chip>
          </div>
          <div
            role="heading"
            aria-level={3}
            className="font-display text-2xl leading-tight tracking-tight"
          >
            <RichText text={text} />
          </div>
          <ul className="mt-4 flex flex-col gap-2">
            {answers.map((a, i) => (
              <li
                key={i}
                className={`border-brutal flex items-center justify-between gap-3 px-3 py-2 text-base font-bold ${
                  i === 0 ? "bg-correct" : "bg-surface"
                }`}
              >
                <span>
                  <RichText text={a} />
                </span>
                {i === 0 && (
                  <Chip variant="correct">{config.labels.correct}</Chip>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm font-medium">
            <RichText text={explanation} />
          </p>
        </div>

        {state.formError && <Error message={state.formError} />}
        {state.saved && (
          <p role="status" className="text-sm font-bold">
            Saved.
          </p>
        )}
        <div className="mt-auto grid grid-cols-3 gap-3">
          <Button
            type="submit"
            name="intent"
            value="reject"
            variant="secondary"
            disabled={pending}
          >
            Reject
          </Button>
          <Button
            type="submit"
            name="intent"
            value="save"
            variant="secondary"
            disabled={pending}
          >
            Save
          </Button>
          <Button
            type="submit"
            name="intent"
            value="approve"
            disabled={pending}
          >
            APPROVE
          </Button>
        </div>
      </div>
    </form>
  );
}

function Error({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="mt-1 flex items-center gap-1.5 text-sm font-bold text-error"
    >
      <AlertIcon />
      {message}
    </p>
  );
}
