/*
  Warnings:

  - Made the column `explanation` on table `Question` required. This step will fail if there are existing NULL values in that column.
  - Made the column `explanation` on table `QuestionSubmission` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Question" ALTER COLUMN "explanation" SET NOT NULL;

-- AlterTable
ALTER TABLE "QuestionSubmission" ADD COLUMN     "creditName" TEXT,
ALTER COLUMN "explanation" SET NOT NULL;
