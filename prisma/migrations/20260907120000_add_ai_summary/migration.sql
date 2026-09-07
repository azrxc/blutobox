-- AlterTable
ALTER TABLE "File" ADD COLUMN "aiSummary" TEXT,
ADD COLUMN "aiSummaryGeneratedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN "freeAiSummariesUsed" INTEGER NOT NULL DEFAULT 0;
