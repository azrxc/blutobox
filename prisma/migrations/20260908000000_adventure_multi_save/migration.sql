-- DropIndex
DROP INDEX "Adventure_ownerId_key";

-- DropIndex
DROP INDEX "Adventure_anonToken_key";

-- CreateIndex
CREATE INDEX "Adventure_ownerId_idx" ON "Adventure"("ownerId");

-- CreateIndex
CREATE INDEX "Adventure_anonToken_idx" ON "Adventure"("anonToken");
