-- CreateTable
CREATE TABLE "DailyCharacter" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "traits" JSONB NOT NULL,
    "portrait" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyCharacter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterStreak" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT,
    "anonToken" TEXT,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastClaimedDate" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CharacterStreak_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedCharacter" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT,
    "anonToken" TEXT,
    "name" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "traits" JSONB NOT NULL,
    "portrait" TEXT NOT NULL,
    "sourceDate" TEXT NOT NULL,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedCharacter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyCharacter_date_key" ON "DailyCharacter"("date");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterStreak_ownerId_key" ON "CharacterStreak"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterStreak_anonToken_key" ON "CharacterStreak"("anonToken");

-- CreateIndex
CREATE INDEX "SavedCharacter_ownerId_idx" ON "SavedCharacter"("ownerId");

-- CreateIndex
CREATE INDEX "SavedCharacter_anonToken_idx" ON "SavedCharacter"("anonToken");

-- AddForeignKey
ALTER TABLE "CharacterStreak" ADD CONSTRAINT "CharacterStreak_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedCharacter" ADD CONSTRAINT "SavedCharacter_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
