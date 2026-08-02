import { prisma } from "@/lib/prisma";
import { REFERRAL_BONUS_BYTES, MAX_REFERRAL_BONUS_BYTES } from "@/lib/limits";

export async function grantReferralBonus(referrerId: string, newUserId: string) {
  const [referrer, newUser] = await Promise.all([
    prisma.user.findUnique({ where: { id: referrerId }, select: { bonusStorageBytes: true } }),
    prisma.user.findUnique({ where: { id: newUserId }, select: { bonusStorageBytes: true } }),
  ]);
  if (!referrer || !newUser) return;

  const cap = BigInt(MAX_REFERRAL_BONUS_BYTES);
  const bonus = BigInt(REFERRAL_BONUS_BYTES);
  const referrerNew = referrer.bonusStorageBytes + bonus;
  const newUserNew = newUser.bonusStorageBytes + bonus;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: referrerId },
      data: { bonusStorageBytes: referrerNew > cap ? cap : referrerNew },
    }),
    prisma.user.update({
      where: { id: newUserId },
      data: { bonusStorageBytes: newUserNew > cap ? cap : newUserNew },
    }),
  ]);
}
