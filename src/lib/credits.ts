import { db } from "@/lib/db";

/**
 * Unique credit names of approved questions, sorted alphabetically.
 * Anonymous questions (null or empty creditName) are left out.
 */
export async function getCreditNames(quizSlug: string): Promise<string[]> {
  const rows = await db.question.findMany({
    where: {
      approved: true,
      quiz: { slug: quizSlug },
      creditName: { not: null },
    },
    select: { creditName: true },
  });

  const unique = new Map<string, string>();
  for (const { creditName } of rows) {
    const name = creditName?.trim();
    if (name && !unique.has(name.toLowerCase())) {
      unique.set(name.toLowerCase(), name);
    }
  }
  return [...unique.values()].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" }),
  );
}
