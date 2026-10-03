// Ensures the Quiz row exists for real (approved) question submissions.
// Mock questions are NOT seeded here; they're merged at runtime in lib/questions.ts.
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { triviaConfig } from "../src/config/trivia";

config({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const quiz = await prisma.quiz.upsert({
    where: { slug: triviaConfig.slug },
    update: { title: triviaConfig.title },
    create: { slug: triviaConfig.slug, title: triviaConfig.title },
  });

  console.log(`Quiz "${quiz.slug}" ready.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
