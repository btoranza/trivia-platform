"use client";

import { useActionState, useState } from "react";
import { submitQuestion, type SubmitState } from "@/app/submit/actions";
import { triviaConfig as config } from "@/config/trivia";
import { ANSWER_COUNT, LIMITS } from "@/lib/submissions";
import { Button } from "./Button";
import { Card } from "./Card";

const form = config.form;

const initialState: SubmitState = {
  status: "idle",
  errors: {},
  values: {
    text: "",
    answers: Array.from({ length: ANSWER_COUNT }, () => ""),
    correct: "",
    difficulty: config.defaultDifficulty,
    explanation: "",
    creditName: "",
    anonymous: false,
  },
};

const input =
  "border-brutal w-full bg-surface px-3 py-3 text-base font-medium text-ink placeholder:text-ink/60";
const label = "text-sm font-bold uppercase tracking-wide";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1 text-sm font-bold">
      ⚠ {message}
    </p>
  );
}

export function SubmitForm() {
  const [state, action, pending] = useActionState(submitQuestion, initialState);
  const [dismissed, setDismissed] = useState<SubmitState | null>(null);
  const { errors, values } = state;

  if (state.status === "success" && dismissed !== state) {
    return (
      <Card>
        <h2 className="font-display text-3xl uppercase leading-none tracking-tight">
          {form.successTitle}
        </h2>
        <p className="mt-3 text-lg font-medium">{form.successMessage}</p>
        <div className="mt-5">
          <Button variant="secondary" onClick={() => setDismissed(state)}>
            {form.submitAnother}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-6" noValidate>
      {/* Honeypot: hidden from people and assistive tech, bots tend to fill it. */}
      <div aria-hidden="true" className="absolute -left-[9999px]">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div>
        <label htmlFor="text" className={label}>
          {form.question}
        </label>
        <textarea
          id="text"
          name="text"
          rows={3}
          maxLength={LIMITS.question}
          defaultValue={values.text}
          aria-invalid={Boolean(errors.text)}
          aria-describedby="text-error"
          className={`${input} mt-2 resize-none`}
        />
        <FieldError id="text-error" message={errors.text} />
      </div>

      <fieldset>
        <legend className={label}>{form.answers}</legend>
        <div className="mt-2 flex flex-col gap-3">
          {values.answers.map((answer, i) => (
            <div key={i} className="flex items-center gap-3">
              <label className="flex shrink-0 flex-col items-center gap-1 text-xs font-bold uppercase">
                <input
                  type="radio"
                  name="correct"
                  value={i}
                  defaultChecked={values.correct === String(i)}
                  className="size-6 accent-ink"
                  aria-label={`${form.correctAnswer}: ${form.answerPlaceholder} ${i + 1}`}
                />
                {form.correctAnswer}
              </label>
              <input
                type="text"
                name={`answer-${i}`}
                maxLength={LIMITS.answer}
                defaultValue={answer}
                placeholder={`${form.answerPlaceholder} ${i + 1}`}
                aria-label={`${form.answerPlaceholder} ${i + 1}`}
                aria-invalid={Boolean(errors.answers)}
                aria-describedby="answers-error"
                className={input}
              />
            </div>
          ))}
        </div>
        <FieldError id="answers-error" message={errors.answers} />
        <FieldError id="correct-error" message={errors.correct} />
      </fieldset>

      <fieldset>
        <legend className={label}>{form.difficulty}</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {config.difficulties.map((d) => (
            <label key={d}>
              <input
                type="radio"
                name="difficulty"
                value={d}
                defaultChecked={values.difficulty === d}
                className="peer sr-only"
              />
              <span className="border-brutal inline-flex cursor-pointer items-center rounded-pill bg-surface px-4 py-2 text-sm font-bold uppercase tracking-wide text-ink peer-checked:bg-ink peer-checked:text-canvas peer-focus-visible:outline-3 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-ink">
                {d}
              </span>
            </label>
          ))}
        </div>
        <FieldError id="difficulty-error" message={errors.difficulty} />
      </fieldset>

      <div>
        <label htmlFor="explanation" className={label}>
          {form.explanation}
        </label>
        <p className="mt-1 text-sm font-medium">{form.explanationHint}</p>
        <textarea
          id="explanation"
          name="explanation"
          rows={3}
          maxLength={LIMITS.explanation}
          defaultValue={values.explanation}
          aria-invalid={Boolean(errors.explanation)}
          aria-describedby="explanation-error"
          className={`${input} mt-2 resize-none`}
        />
        <FieldError id="explanation-error" message={errors.explanation} />
      </div>

      <div>
        <label className="flex items-center gap-3 text-base font-bold">
          <input
            type="checkbox"
            name="anonymous"
            defaultChecked={values.anonymous}
            className="peer size-6 accent-ink"
          />
          {form.anonymous}
        </label>
        <label htmlFor="creditName" className={`${label} mt-4 block`}>
          {form.name}
        </label>
        <input
          id="creditName"
          type="text"
          name="creditName"
          maxLength={LIMITS.name}
          defaultValue={values.creditName}
          aria-describedby="creditName-error"
          className={`${input} mt-2 peer-checked:pointer-events-none peer-checked:opacity-40`}
        />
        <FieldError id="creditName-error" message={errors.creditName} />
      </div>

      <div aria-live="polite">
        {state.formError && (
          <p className="border-brutal bg-surface p-3 text-sm font-bold">
            ⚠ {state.formError}
          </p>
        )}
      </div>

      <Button type="submit" disabled={pending} aria-disabled={pending}>
        {pending ? form.sending : form.submit}
      </Button>
    </form>
  );
}
