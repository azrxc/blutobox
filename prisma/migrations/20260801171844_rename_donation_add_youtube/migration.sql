/*
  Warnings:

  - You are about to drop the column `donationUrl` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "donationUrl",
ADD COLUMN     "supportUrl" TEXT,
ADD COLUMN     "youtubeUrl" TEXT;
