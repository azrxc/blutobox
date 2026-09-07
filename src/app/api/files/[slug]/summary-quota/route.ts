import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getClientIp } from "@/lib/request-ip";
import { getCurrentPlanTier } from "@/lib/plan";
import { dailySummaryLimitFor } from "@/lib/limits";
import { checkDailyQuota } from "@/lib/daily-quota";

export async function GET(req: Request) {
  const session = await auth();
  const planTier = await getCurrentPlanTier(session?.user?.id);
  const identifier = session?.user?.id ?? `ip:${getClientIp(req)}`;
  const limit = dailySummaryLimitFor(planTier);

  const { used } = await checkDailyQuota("ai-summary", identifier, limit);

  return NextResponse.json({ used, limit });
}
