import { prisma } from "@/lib/prisma";
import { REFERRAL_BONUS_BYTES, MAX_REFERRAL_BONUS_BYTES, MAX_REFERRAL_CREATOR_LINK_BONUS } from "@/lib/limits";

export async function grantReferralBonus(referrerId: string, newUserId: string) {
  const [referrer, newUser] = await Promise.all([
    prisma.user.findUnique({ where: { id: referrerId }, select: { bonusStorageBytes: true, bonusCreatorLinks: true } }),
    prisma.user.findUnique({ where: { id: newUserId }, select: { bonusStorageBytes: true, bonusCreatorLinks: true } }),
  ]);
  if (!referrer || !newUser) return;

  const storageCap = BigInt(MAX_REFERRAL_BONUS_BYTES);
  const storageBonus = BigInt(REFERRAL_BONUS_BYTES);
  const referrerNewStorage = referrer.bonusStorageBytes + storageBonus;
  const newUserNewStorage = newUser.bonusStorageBytes + storageBonus;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: referrerId },
      data: {
        bonusStorageBytes: referrerNewStorage > storageCap ? storageCap : referrerNewStorage,
        bonusCreatorLinks: Math.min(referrer.bonusCreatorLinks + 1, MAX_REFERRAL_CREATOR_LINK_BONUS),
      },
    }),
    prisma.user.update({
      where: { id: newUserId },
      data: {
        bonusStorageBytes: newUserNewStorage > storageCap ? storageCap : newUserNewStorage,
        bonusCreatorLinks: Math.min(newUser.bonusCreatorLinks + 1, MAX_REFERRAL_CREATOR_LINK_BONUS),
      },
    }),
  ]);
}
