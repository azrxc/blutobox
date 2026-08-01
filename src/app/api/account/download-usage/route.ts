import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getClientIp } from "@/lib/request-ip";
import { dailyDownloadBytesFor } from "@/lib/limits";
import { checkDownloadQuota } from "@/lib/download-quota";
import { getCurrentPlanTier } from "@/lib/plan";

export async function GET(req: Request) {
  const session = await auth();
  const planTier = await getCurrentPlanTier(session?.user?.id);
  const identifier = session?.user?.id ?? `ip:${getClientIp(req)}`;
  const totalBytes = dailyDownloadBytesFor(planTier);

  const { usedBytes } = await checkDownloadQuota(identifier, 0, totalBytes);

  return NextResponse.json({ usedBytes, totalBytes });
}
