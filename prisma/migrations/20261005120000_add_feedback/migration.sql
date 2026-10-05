-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "creditName" TEXT,
    "handled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE INDEX "Feedback_quizId_idx" ON "Feedback"("quizId");
-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
