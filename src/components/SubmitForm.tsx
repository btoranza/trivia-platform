"use client";

import { useActionState, useState } from "react";
import { submitQuestion, type SubmitState } from "@/app/submit/actions";
import { triviaConfig as config } from "@/config/trivia";
import { ANSWER_COUNT, LIMITS } from "@/lib/submissions";
import { AlertIcon } from "./AlertIcon";
import { Button } from "./Button";
import { Card } from "./Card";
import { RichText } from "./RichText";

const form = config.form;

const initialState: SubmitState = {
  status: "idle",
  errors: {},
  values: {
    text: "",
    answers: Array.from({ length: ANSWER_COUNT }, () => ""),
    difficulty: config.defaultDifficulty,
    explanation: "",
    creditName: "",
    anonymous: false,
  },
};

const input =
  "border-brutal w-full px-3 py-3 text-base font-medium text-ink placeholder:text-ink/60";
const label = "text-sm font-bold uppercase tracking-wide";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p
      id={id}
      role="alert"
      className="mt-1 flex items-center gap-1.5 text-sm font-bold text-error"
    >
      <AlertIcon />
      {message}
    </p>
  );
}

export function SubmitForm() {
  const [state, action, pending] = useActionState(submitQuestion, initialState);
  const [dismissed, setDismissed] = useState<SubmitState | null>(null);
  const [anonymous, setAnonymous] = useState(false);
  const { errors, values } = state;

  if (state.status === "success" && dismissed !== state) {
    return (
      <Card>
        <h2 className="font-display text-3xl uppercase leading-none tracking-tight">
          {form.successTitle}
        </h2>
        <p className="mt-3 text-lg font-medium">{form.successMessage}</p>
        <div className="mt-5">
          <Button
            variant="secondary"
            onClick={() => {
              setAnonymous(false);
              setDismissed(state);
            }}
          >
            {form.submitAnother}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <form
      action={action}
      className="flex flex-col gap-6 md:grid md:grid-cols-2 md:items-start md:gap-x-10 md:gap-y-6"
      noValidate
    >
      {/* Honeypot: hidden from people and assistive tech, bots tend to fill it. */}
      <div aria-hidden="true" className="absolute -left-[9999px]">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="flex flex-col gap-5">
        <div>
          <label htmlFor="text" className={label}>
            {form.question}
          </label>
          <p className="mt-1 text-xs font-medium">
            <RichText text={form.codeHint} />
          </p>
          <textarea
            id="text"
            name="text"
            rows={3}
            maxLength={LIMITS.question}
            defaultValue={values.text}
            aria-invalid={Boolean(errors.text)}
            aria-describedby="text-error"
            className={`${input} mt-2 resize-none bg-surface`}
          />
          <FieldError id="text-error" message={errors.text} />
        </div>

        <fieldset className="flex flex-col gap-3">
          {values.answers.map((answer, i) => {
            const text = i === 0 ? form.correctAnswer : form.wrongAnswer;
            return (
              <div key={i} className="md:flex md:items-center md:gap-3">
                <label
                  htmlFor={`answer-${i}`}
                  className={`${label} md:w-20 md:shrink-0`}
                >
                  {text}
                </label>
                <input
                  id={`answer-${i}`}
                  type="text"
                  name={`answer-${i}`}
                  aria-label={i === 0 ? text : `${text} ${i}`}
                  maxLength={LIMITS.answer}
                  defaultValue={answer}
                  aria-invalid={Boolean(errors.answers)}
                  aria-describedby="answers-error"
                  className={`${input} mt-2 md:mt-0 ${i === 0 ? "bg-correct" : "bg-surface"}`}
                />
              </div>
            );
          })}
          <FieldError id="answers-error" message={errors.answers} />
        </fieldset>
      </div>

      <div className="flex flex-col gap-5">
        <div>
          <label htmlFor="explanation" className={label}>
            {form.explanation}
          </label>
          <textarea
            id="explanation"
            name="explanation"
            rows={3}
            maxLength={LIMITS.explanation}
            defaultValue={values.explanation}
            placeholder={form.explanationHint}
            aria-invalid={Boolean(errors.explanation)}
            aria-describedby="explanation-error"
            className={`${input} mt-2 resize-none bg-surface`}
          />
          <FieldError id="explanation-error" message={errors.explanation} />
        </div>

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
          <label htmlFor="creditName" className={label}>
            {form.name}
          </label>
          <div className="mt-2 flex items-center gap-4">
            <input
              id="creditName"
              type="text"
              name="creditName"
              maxLength={LIMITS.name}
              defaultValue={values.creditName}
              disabled={anonymous}
              aria-describedby="creditName-error"
              className={`${input} min-w-0 flex-1 bg-surface disabled:opacity-40`}
            />
            <label className="flex shrink-0 items-center gap-2 text-base font-bold">
              <input
                type="checkbox"
                name="anonymous"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
                className="size-6 accent-ink"
              />
              {form.anonymous}
            </label>
          </div>
          <FieldError id="creditName-error" message={errors.creditName} />
        </div>
        <div>
          <Button type="submit" disabled={pending} aria-disabled={pending}>
            {pending ? form.sending : form.submit}
          </Button>
        </div>
      </div>
      {state.formError && (
        <p
          role="alert"
          className="flex items-center justify-center gap-1.5 whitespace-nowrap text-sm font-bold text-error md:col-span-2 md:-mt-3"
        >
          <AlertIcon />
          {state.formError}
        </p>
      )}
    </form>
  );
}
