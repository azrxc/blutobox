-- CreateTable
CREATE TABLE "Adventure" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT,
    "anonToken" TEXT,
    "scenario" TEXT NOT NULL,
    "turns" JSONB NOT NULL,
    "turnCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastPlayedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Adventure_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Adventure_ownerId_key" ON "Adventure"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "Adventure_anonToken_key" ON "Adventure"("anonToken");

-- AddForeignKey
ALTER TABLE "Adventure" ADD CONSTRAINT "Adventure_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
