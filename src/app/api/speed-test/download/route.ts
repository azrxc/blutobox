import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSignedDownloadUrl } from "@/lib/storage";
import { getClientIp } from "@/lib/request-ip";
import { dailyDownloadBytesFor } from "@/lib/limits";
import { checkDownloadQuota, consumeDownloadQuota } from "@/lib/download-quota";
import { createStreamToken } from "@/lib/stream-token";
import { getCurrentPlanTier } from "@/lib/plan";
import { checkAnonDailyDownloadCountLimit } from "@/lib/rate-limit";

// A fixed-size file uploaded once to B2 (see LAUNCH_CHECKLIST.md) purely for this tool.
// Reuses the exact same tiered path real downloads take (Pro -> straight to B2 at full
// speed, Free/anon -> throttled proxy) and counts against the same daily quota as a real
// download would, so this can't be used to get free bandwidth outside the normal caps.
const SPEED_TEST_KEY = "_system/speed-test-25mb.bin";
const SPEED_TEST_BYTES = 26214400; // 25 MiB

export async function GET(req: Request) {
  const session = await auth();
  const planTier = await getCurrentPlanTier(session?.user?.id);
  const ip = getClientIp(req);
  const identifier = session?.user?.id ?? `ip:${ip}`;
  const dailyLimit = dailyDownloadBytesFor(planTier);

  if (!session?.user) {
    const { success } = await checkAnonDailyDownloadCountLimit(ip);
    if (!success) {
      return NextResponse.json(
        { error: "Too many downloads from this network today. Log in for a higher limit, or try again tomorrow." },
        { status: 429 }
      );
    }
  }

  const quota = await checkDownloadQuota(identifier, SPEED_TEST_BYTES, dailyLimit);
  if (!quota.allowed) {
    return NextResponse.json(
      { error: "You've hit your daily download limit - try the speed test again tomorrow." },
      { status: 429 }
    );
  }

  const url = await getSignedDownloadUrl(SPEED_TEST_KEY, {
    filename: "bluto-box-speed-test.bin",
    forceDownload: true,
  });

  if (planTier === "PRO") {
    await consumeDownloadQuota(identifier, SPEED_TEST_BYTES);
    return NextResponse.redirect(url);
  }

  const token = await createStreamToken({
    url,
    filename: "bluto-box-speed-test.bin",
    exp: Date.now() + 5 * 60 * 1000,
    identifier,
  });
  const origin = new URL(req.url).origin;
  return NextResponse.redirect(`${origin}/api/stream?t=${encodeURIComponent(token)}`);
}
