"use client";

import { useActionState, useState } from "react";
import { submitFeedback, type FeedbackState } from "@/app/feedback/actions";
import { triviaConfig as config } from "@/config/trivia";
import { FEEDBACK_LIMITS } from "@/lib/feedback";
import { AlertIcon } from "./AlertIcon";
import { Button } from "./Button";
import { Card } from "./Card";

const copy = config.feedback;

const initialState: FeedbackState = {
  status: "idle",
  errors: {},
  values: { message: "", creditName: "", anonymous: false },
};

const input =
  "border-brutal w-full px-3 py-2 md:py-3 text-base font-medium text-ink placeholder:text-ink/60";
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

export function FeedbackForm() {
  const [state, action, pending] = useActionState(submitFeedback, initialState);
  const [dismissed, setDismissed] = useState<FeedbackState | null>(null);
  const [anonymous, setAnonymous] = useState(false);
  const { errors, values } = state;

  if (state.status === "success" && dismissed !== state) {
    return (
      <Card>
        <h2 className="font-display text-3xl uppercase leading-none tracking-tight">
          {copy.successTitle}
        </h2>
        <p className="mt-3 text-lg font-medium">{copy.successMessage}</p>
        <div className="mt-5">
          <Button
            variant="secondary"
            onClick={() => {
              setAnonymous(false);
              setDismissed(state);
            }}
          >
            {copy.sendAnother}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4 md:gap-5" noValidate>
      {/* Honeypot: hidden from people and assistive tech, bots tend to fill it. */}
      <div aria-hidden="true" className="absolute -left-[9999px]">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div>
        <label htmlFor="message" className={label}>
          {copy.message}
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          maxLength={FEEDBACK_LIMITS.message}
          defaultValue={values.message}
          aria-invalid={Boolean(errors.message)}
          aria-describedby="message-error"
          className={`${input} mt-2 resize-none bg-surface max-md:h-36`}
        />
        <FieldError id="message-error" message={errors.message} />
      </div>

      <div>
        <label htmlFor="creditName" className={label}>
          {copy.name}
        </label>
        <div className="mt-2 flex items-center gap-4">
          <input
            id="creditName"
            type="text"
            name="creditName"
            maxLength={FEEDBACK_LIMITS.name}
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
            {config.form.anonymous}
          </label>
        </div>
        <FieldError id="creditName-error" message={errors.creditName} />
      </div>

      <div>
        <Button type="submit" disabled={pending} aria-disabled={pending}>
          {pending ? copy.sending : copy.submit}
        </Button>
      </div>
      {state.formError && (
        <p
          role="alert"
          className="flex items-center justify-center gap-1.5 text-sm font-bold text-error"
        >
          <AlertIcon />
          {state.formError}
        </p>
      )}
    </form>
  );
}
