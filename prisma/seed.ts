// Ensures the Quiz row exists and loads the curated questions.
// Safe to re-run: everything is upserted by a stable id.
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { triviaConfig } from "../src/config/trivia";
import { withExplicitSsl } from "../src/lib/db-url";
import curated from "./questions/frontend.json";

config({ path: ".env.local" });

const adapter = new PrismaPg({
  connectionString: withExplicitSsl(process.env.DATABASE_URL),
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const quiz = await prisma.quiz.upsert({
    where: { slug: triviaConfig.slug },
    update: { title: triviaConfig.title },
    create: { slug: triviaConfig.slug, title: triviaConfig.title },
  });

  for (const q of curated) {
    const data = {
      quizId: quiz.id,
      text: q.text,
      difficulty: q.difficulty,
      explanation: q.explanation,
      // Optional in the JSON: only some questions credit a community member.
      creditName: (q as { creditName?: string }).creditName ?? null,
      approved: true,
    };
    await prisma.question.upsert({
      where: { id: q.id },
      update: data,
      create: { id: q.id, ...data },
    });
    // First answer in the file is the correct one.
    for (const [i, text] of q.answers.entries()) {
      const answerId = `${q.id}-a${i + 1}`;
      const answer = { questionId: q.id, text, isCorrect: i === 0 };
      await prisma.answer.upsert({
        where: { id: answerId },
        update: answer,
        create: { id: answerId, ...answer },
      });
    }
  }

  console.log(`Quiz "${quiz.slug}" ready with ${curated.length} questions.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
