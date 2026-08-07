import { prisma } from "@/lib/prisma";

// Single source of truth for "is this user effectively Pro right now" - accounts for
// both a real subscription (planTier) and a one-time day/week pass (proPassExpiresAt).
// Every place that checks plan tier should go through this (or effectivePlanTier below,
// if it already has the row fetched) rather than reading the raw planTier field, so a
// pass purchase reflects consistently everywhere: server-side limit enforcement, the
// NextAuth session/JWT, and the cleanup cron's "is this user still on Free" queries.
export function effectivePlanTier(user: {
  planTier: "FREE" | "PRO";
  proPassExpiresAt: Date | null;
}): "FREE" | "PRO" {
  if (user.planTier === "PRO") return "PRO";
  if (user.proPassExpiresAt && user.proPassExpiresAt.getTime() > Date.now()) return "PRO";
  return "FREE";
}

export async function getCurrentPlanTier(userId: string | null | undefined): Promise<"FREE" | "PRO" | null> {
  if (!userId) return null;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { planTier: true, proPassExpiresAt: true },
  });
  return user ? effectivePlanTier(user) : null;
}
