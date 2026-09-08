-- CreateTable
CREATE TABLE "DailyTrivia" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "questions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyTrivia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TriviaStreak" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT,
    "anonToken" TEXT,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastPlayedDate" TEXT,
    "lastScore" INTEGER,
    "lastAnswers" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TriviaStreak_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyTrivia_date_key" ON "DailyTrivia"("date");

-- CreateIndex
CREATE UNIQUE INDEX "TriviaStreak_ownerId_key" ON "TriviaStreak"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "TriviaStreak_anonToken_key" ON "TriviaStreak"("anonToken");

-- AddForeignKey
ALTER TABLE "TriviaStreak" ADD CONSTRAINT "TriviaStreak_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
