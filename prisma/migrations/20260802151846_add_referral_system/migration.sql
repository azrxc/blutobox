-- Purely additive: two new nullable/defaulted columns on "User" for the referral program.
-- No existing data is touched, so no UPDATE/backfill step is needed.

ALTER TABLE "User" ADD COLUMN     "referredById" TEXT,
ADD COLUMN     "bonusStorageBytes" BIGINT NOT NULL DEFAULT 0;

CREATE INDEX "User_referredById_idx" ON "User"("referredById");

ALTER TABLE "User" ADD CONSTRAINT "User_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
