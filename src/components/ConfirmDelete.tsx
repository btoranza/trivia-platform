"use client";

import { useRef } from "react";
import { Button } from "./Button";

type Props = {
  /** Server action that does the deletion; runs only after confirming. */
  action: () => Promise<void>;
  title: string;
  message: string;
};

/** A "Delete" button that asks for confirmation in a modal first. */
export function ConfirmDelete({ action, title, message }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <>
      <Button variant="secondary" onClick={() => dialog.current?.showModal()}>
        Delete
      </Button>
      <dialog
        ref={dialog}
        aria-labelledby="confirm-delete-title"
        className="border-brutal m-auto w-[calc(100%-2rem)] max-w-sm bg-surface p-5 text-ink shadow-lg backdrop:bg-ink/60"
      >
        <h3
          id="confirm-delete-title"
          className="font-display text-2xl uppercase leading-none tracking-tight"
        >
          {title}
        </h3>
        <p className="mt-3 text-base font-medium">{message}</p>
        <div className="mt-5 flex gap-3">
          <Button variant="secondary" onClick={() => dialog.current?.close()}>
            Cancel
          </Button>
          <form action={action} className="flex-1">
            <Button type="submit">Yes, delete</Button>
          </form>
        </div>
      </dialog>
    </>
  );
}
