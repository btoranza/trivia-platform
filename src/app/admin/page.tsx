import type { Metadata } from "next";
import { connection } from "next/server";
import { AdminLoginForm } from "@/components/AdminLoginForm";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Chip } from "@/components/Chip";
import { RichText } from "@/components/RichText";
import { HomeLink } from "@/components/HomeLink";
import { triviaConfig as config } from "@/config/trivia";
import { getAdminPassword, isAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { approveSubmission, logout, rejectSubmission } from "./actions";

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
      {submissions.map((s) => {
        const answers = s.answers as StoredAnswer[];
        return (
          <Card key={s.id}>
            <div className="flex flex-wrap items-center gap-2">
              <Chip variant="inverted">{s.difficulty}</Chip>
              <Chip>{s.creditName ?? "Anonymous"}</Chip>
              <span className="text-xs font-bold">
                {s.createdAt.toLocaleString("en-US")}
              </span>
            </div>
            <div
              role="heading"
              aria-level={2}
              className="mt-3 text-xl font-bold"
            >
              <RichText text={s.text} />
            </div>
            <ul className="mt-3 flex flex-col gap-2">
              {answers.map((a, i) => (
                <li
                  key={i}
                  className={`border-brutal flex items-center justify-between gap-3 px-3 py-2 text-base font-bold ${
                    a.isCorrect ? "bg-correct" : "bg-surface"
                  }`}
                >
                  <span>
                    <RichText text={a.text} />
                  </span>
                  {a.isCorrect && (
                    <Chip variant="correct">{config.labels.correct}</Chip>
                  )}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm font-medium">
              <RichText text={s.explanation} />
            </p>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <form action={rejectSubmission.bind(null, s.id)}>
                <Button type="submit" variant="secondary">
                  Reject
                </Button>
              </form>
              <form action={approveSubmission.bind(null, s.id)}>
                <Button type="submit">APPROVE</Button>
              </form>
            </div>
          </Card>
        );
      })}
    </Shell>
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
    <main className="mx-auto flex w-full flex-1 flex-col gap-6 md:max-w-2xl">
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
