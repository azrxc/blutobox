-- Reconstructed placeholder (2026-09-07): the database's _prisma_migrations table
-- references this migration name, but the local migration folder had been renamed
-- to 20260801171844_rename_donation_add_youtube at some point after it was applied,
-- leaving a mismatch between recorded history and the local folder. This file
-- restores the missing folder with the same SQL the applied migration actually ran
-- (confirmed: User.donationUrl no longer exists, User.supportUrl/youtubeUrl did
-- exist), purely so `prisma migrate resolve --applied` can locate it and the
-- tracked history is consistent again. Not re-run - resolve only marks it applied.
-- AlterTable
ALTER TABLE "User" DROP COLUMN "donationUrl",
ADD COLUMN     "supportUrl" TEXT,
ADD COLUMN     "youtubeUrl" TEXT;
