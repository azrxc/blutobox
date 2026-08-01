-- CreateTable
CREATE TABLE "CreatorLink" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreatorLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CreatorLink_userId_idx" ON "CreatorLink"("userId");

-- AddForeignKey
ALTER TABLE "CreatorLink" ADD CONSTRAINT "CreatorLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Preserve existing fixed-column values (discordUrl/youtubeUrl/supportUrl) as rows before dropping them
INSERT INTO "CreatorLink" ("id", "userId", "label", "url", "order", "createdAt")
SELECT gen_random_uuid()::text, "id", 'Discord', "discordUrl", 0, CURRENT_TIMESTAMP
FROM "User" WHERE "discordUrl" IS NOT NULL;

INSERT INTO "CreatorLink" ("id", "userId", "label", "url", "order", "createdAt")
SELECT gen_random_uuid()::text, "id", 'YouTube', "youtubeUrl", 1, CURRENT_TIMESTAMP
FROM "User" WHERE "youtubeUrl" IS NOT NULL;

INSERT INTO "CreatorLink" ("id", "userId", "label", "url", "order", "createdAt")
SELECT gen_random_uuid()::text, "id", 'Support', "supportUrl", 2, CURRENT_TIMESTAMP
FROM "User" WHERE "supportUrl" IS NOT NULL;

-- AlterTable: drop the old fixed columns now that their data is preserved above
ALTER TABLE "User" DROP COLUMN "discordUrl";
ALTER TABLE "User" DROP COLUMN "youtubeUrl";
ALTER TABLE "User" DROP COLUMN "supportUrl";
