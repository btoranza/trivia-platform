"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/admin/actions";
import { AlertIcon } from "./AlertIcon";
import { Button } from "./Button";
import { Card } from "./Card";

export function AdminLoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(
    login,
    {},
  );
  return (
    <Card>
      <form action={action} className="flex flex-col gap-4">
        <label
          htmlFor="password"
          className="text-sm font-bold uppercase tracking-wide"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={Boolean(state.error)}
          className="border-brutal w-full bg-surface px-3 py-3 text-base font-medium text-ink"
        />
        {state.error && (
          <p
            role="alert"
            className="flex items-center gap-1.5 text-sm font-bold text-error"
          >
            <AlertIcon />
            {state.error}
          </p>
        )}
        <Button type="submit" disabled={pending} aria-disabled={pending}>
          {pending ? "..." : "ENTER"}
        </Button>
      </form>
    </Card>
  );
}
