-- AlterTable
ALTER TABLE "CharacterStreak" ADD COLUMN "reminderOptIn" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "CharacterStreak" ADD COLUMN "lastReminderSentDate" TEXT;
