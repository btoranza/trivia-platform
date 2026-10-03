import type { Metadata } from "next";
import { connection } from "next/server";
import { AdminLoginForm } from "@/components/AdminLoginForm";
import { AdminReviewForm } from "@/components/AdminReviewForm";
import { Card } from "@/components/Card";
import { HomeLink } from "@/components/HomeLink";
import { triviaConfig as config } from "@/config/trivia";
import { getAdminPassword, isAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { logout } from "./actions";

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
