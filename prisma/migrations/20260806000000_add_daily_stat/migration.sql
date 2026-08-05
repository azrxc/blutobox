-- CreateTable
CREATE TABLE "DailyStat" (
    "date" TEXT NOT NULL,
    "downloadBytes" BIGINT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyStat_pkey" PRIMARY KEY ("date")
);
