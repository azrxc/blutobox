-- AlterTable
ALTER TABLE "DailyCharacter" ADD COLUMN "decoyTraits" JSONB NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "CharacterStreak" ADD COLUMN "lastGuessDate" TEXT;
ALTER TABLE "CharacterStreak" ADD COLUMN "lastGuessCorrect" BOOLEAN;
