import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSignedDownloadUrl } from "@/lib/storage";
import { unlockCookieName, verifyUnlockToken } from "@/lib/link-lock";
import { auth } from "@/lib/auth";
import { getClientIp } from "@/lib/request-ip";
import { dailyDownloadBytesFor } from "@/lib/limits";
import { checkDownloadQuota, consumeDownloadQuota } from "@/lib/download-quota";
import { createStreamToken } from "@/lib/stream-token";
import { getCurrentPlanTier } from "@/lib/plan";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const link = await prisma.shareLink.findUnique({
    where: { slug },
    include: { file: true },
  });

  if (!link || link.file.status !== "ACTIVE") {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
  if (link.expiresAt && link.expiresAt < new Date()) {
    return NextResponse.json({ error: "This link has expired" }, { status: 410 });
  }
  if (link.passwordHash) {
    const cookieHeader = req.headers.get("cookie") ?? "";
    const match = cookieHeader.match(new RegExp(`${unlockCookieName(slug)}=([^;]+)`));
    if (!verifyUnlockToken(slug, match?.[1])) {
      return NextResponse.json({ error: "Locked" }, { status: 401 });
    }
  }

  const session = await auth();
  const planTier = await getCurrentPlanTier(session?.user?.id);
  const identifier = session?.user?.id ?? `ip:${getClientIp(req)}`;
  const dailyLimit = dailyDownloadBytesFor(planTier);
  const fileBytes = Number(link.file.sizeBytes);

  const quota = await checkDownloadQuota(identifier, fileBytes, dailyLimit);
  if (!quota.allowed) {
    const limitGb = Math.floor(dailyLimit / (1024 * 1024 * 1024));
    return NextResponse.json(
      {
        error: session?.user
          ? `You've hit your daily download limit (${limitGb}GB). ${planTier === "PRO" ? "" : "Upgrade to Pro for a higher limit, or "}try again tomorrow.`
          : `You've hit the daily download limit for anonymous downloads (${limitGb}GB). Log in for a higher limit, or try again tomorrow.`,
      },
      { status: 429 }
    );
  }
  await prisma.file.update({
    where: { id: link.file.id },
    data: { downloadCount: { increment: 1 }, lastAccessedAt: new Date(), deletionWarningSentAt: null },
  });

  const url = await getSignedDownloadUrl(link.file.b2Key, {
    filename: link.file.filename,
    forceDownload: true,
  });

  if (planTier === "PRO") {
    // Pro downloads redirect straight to B2 — the app never sees the bytes again after
    // this response, so there's no way to meter actual usage. Charge the full size upfront.
    await consumeDownloadQuota(identifier, fileBytes);
    return NextResponse.redirect(url);
  }

  // Free/anonymous downloads are proxied through /api/stream, which can see real bytes
  // as they're sent — quota is charged incrementally there instead of upfront here, so
  // a cancelled/abandoned download only counts what actually transferred.
  const token = await createStreamToken({
    url,
    filename: link.file.filename,
    exp: Date.now() + 5 * 60 * 1000,
    identifier,
  });
  const origin = new URL(req.url).origin;
  return NextResponse.redirect(`${origin}/api/stream?t=${encodeURIComponent(token)}`);
}
