import { prisma } from "@/lib/prisma";

export async function getCurrentPlanTier(userId: string | null | undefined): Promise<"FREE" | "PRO" | null> {
  if (!userId) return null;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { planTier: true } });
  return user?.planTier ?? null;
}
