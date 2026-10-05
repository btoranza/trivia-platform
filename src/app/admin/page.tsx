import type { Metadata } from "next";
import { connection } from "next/server";
import { AdminLoginForm } from "@/components/AdminLoginForm";
import { AdminReviewForm } from "@/components/AdminReviewForm";
import { Card } from "@/components/Card";
import { HomeLink } from "@/components/HomeLink";
import { triviaConfig as config } from "@/config/trivia";
import { getAdminPassword, isAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { Button } from "@/components/Button";
import { ConfirmDelete } from "@/components/ConfirmDelete";
import {
  deleteFeedback,
  logout,
  markFeedbackHandled,
  markFeedbackUnread,
} from "./actions";

export const metadata: Metadata = {
  title: `Admin · ${config.title}`,
  robots: { index: false, follow: false },
};

type StoredAnswer = { text: string; isCorrect: boolean };

export default async function AdminPage() {
  // Always render per request: depends on env vars and the session cookie.
  await connection();
  if (!getAdminPassword()) {
    return (
      <Shell>
        <Card>
          <p className="text-lg font-bold">
            Admin is disabled. Set the ADMIN_PASSWORD environment variable and
            restart the server.
          </p>
        </Card>
      </Shell>
    );
  }

  if (!(await isAdmin())) {
    return (
      <Shell>
        <AdminLoginForm />
      </Shell>
    );
  }

  const submissions = await db.questionSubmission.findMany({
    where: { status: "pending", quiz: { slug: config.slug } },
    orderBy: { createdAt: "asc" },
  });

  const notes = await db.feedback.findMany({
    where: { quiz: { slug: config.slug } },
    orderBy: { createdAt: "asc" },
  });
  const unread = notes.filter((n) => !n.handled);
  const read = notes.filter((n) => n.handled).toReversed();

  return (
    <Shell
      action={
        <form action={logout}>
          <button
            type="submit"
            className="text-sm font-bold uppercase tracking-wide underline underline-offset-2"
          >
            Log out
          </button>
        </form>
      }
    >
      <p className="text-lg font-bold">
        {submissions.length === 0
          ? "No pending questions."
          : `${submissions.length} pending`}
      </p>
      {submissions.map((s) => (
        <Card key={s.id}>
          <AdminReviewForm
            id={s.id}
            createdAt={s.createdAt.toLocaleString("en-US")}
            creditName={s.creditName}
            initial={{
              text: s.text,
              difficulty: s.difficulty,
              answers: (s.answers as StoredAnswer[])
                .toSorted((x, y) => Number(y.isCorrect) - Number(x.isCorrect))
                .map((a) => a.text),
              explanation: s.explanation,
            }}
          />
        </Card>
      ))}
      <h2 className="font-display text-2xl uppercase leading-none tracking-tight">
        Feedback
      </h2>
      <p className="text-lg font-bold">
        {unread.length === 0 ? "No unread notes." : `${unread.length} unread`}
      </p>
      {unread.map((n) => (
        <NoteCard key={n.id} note={n} />
      ))}
      {read.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer text-lg font-bold underline underline-offset-2">
            Read notes ({read.length})
          </summary>
          <div className="mt-4 flex flex-col gap-6">
            {read.map((n) => (
              <NoteCard key={n.id} note={n} read />
            ))}
          </div>
        </details>
      )}
    </Shell>
  );
}

type Note = {
  id: string;
  message: string;
  creditName: string | null;
  createdAt: Date;
};

function NoteCard({ note, read = false }: { note: Note; read?: boolean }) {
  return (
    <Card>
      <p className="text-xs font-bold uppercase tracking-wide">
        {note.createdAt.toLocaleString("en-US")} ·{" "}
        <span className="normal-case">{note.creditName ?? "Anonymous"}</span>
      </p>
      <p className="mt-2 whitespace-pre-wrap text-base font-medium">
        {note.message}
      </p>
      <div className="mt-4 flex flex-col gap-3 md:flex-row">
        <form
          action={(read ? markFeedbackUnread : markFeedbackHandled).bind(
            null,
            note.id,
          )}
          className="md:w-48"
        >
          <Button type="submit" variant="secondary">
            {read ? "Mark as unread" : "Mark as read"}
          </Button>
        </form>
        <div className="md:w-48">
          <ConfirmDelete
            action={deleteFeedback.bind(null, note.id)}
            title="Delete this note?"
            message="It will be removed from the database for good. This can't be undone."
          />
        </div>
      </div>
    </Card>
  );
}

function Shell({
  children,
  action,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <main className="mx-auto flex w-full flex-1 flex-col gap-6 md:max-w-5xl">
      <div className="flex items-center justify-between">
        <HomeLink />
        {action}
      </div>
      <h1 className="font-display text-4xl uppercase leading-none tracking-tight">
        Admin
      </h1>
      {children}
    </main>
  );
}
