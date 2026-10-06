-- CreateTable
CREATE TABLE "QuizPlay" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "random" BOOLEAN NOT NULL,
    "difficulty" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizPlay_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuizPlay_quizId_createdAt_idx" ON "QuizPlay"("quizId", "createdAt");

-- AddForeignKey
ALTER TABLE "QuizPlay" ADD CONSTRAINT "QuizPlay_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

