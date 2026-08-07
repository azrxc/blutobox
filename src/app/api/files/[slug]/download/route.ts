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
import { isAgeVerificationRestrictedRegion } from "@/lib/region-block";
import { sendDownloadNotificationEmail } from "@/lib/email";
import { checkAnonDailyDownloadCountLimit } from "@/lib/rate-limit";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const link = await prisma.shareLink.findUnique({
    where: { slug },
    include: { file: { include: { owner: { select: { email: true } } } } },
  });

  if (!link || link.file.status !== "ACTIVE") {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
  if (link.expiresAt && link.expiresAt < new Date()) {
    return NextResponse.json({ error: "This link has expired" }, { status: 410 });
  }
  if (link.file.maxDownloads !== null && link.file.downloadCount >= link.file.maxDownloads) {
    return NextResponse.json({ error: "This link has reached its download limit" }, { status: 410 });
  }
  if (link.file.isNsfw && isAgeVerificationRestrictedRegion(req.headers)) {
    return NextResponse.json(
      { error: "This content isn't available in your region due to local age-verification requirements." },
      { status: 451 }
    );
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
  const ip = getClientIp(req);
  const identifier = session?.user?.id ?? `ip:${ip}`;
  const dailyLimit = dailyDownloadBytesFor(planTier);
  const fileBytes = Number(link.file.sizeBytes);

  if (!session?.user) {
    const { success } = await checkAnonDailyDownloadCountLimit(ip);
    if (!success) {
      return NextResponse.json(
        { error: "Too many downloads from this network today. Log in for a higher limit, or try again tomorrow." },
        { status: 429 }
      );
    }
  }

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
  // No IP/identity captured here - just a timestamp, so Pro's download-analytics view
  // can show a time distribution instead of only a running total.
  await prisma.downloadEvent.create({ data: { fileId: link.file.id } });

  if (link.file.notifyOnDownload && link.file.owner?.email) {
    // Atomically claim the right to send - only the first request that flips
    // downloadNotifiedAt from null wins, so concurrent downloads can't double-send.
    const claimed = await prisma.file.updateMany({
      where: { id: link.file.id, downloadNotifiedAt: null },
      data: { downloadNotifiedAt: new Date() },
    });
    if (claimed.count === 1) {
      sendDownloadNotificationEmail(link.file.owner.email, link.file.filename, slug).catch(() => {});
    }
  }

  const url = await getSignedDownloadUrl(link.file.b2Key, {
    filename: link.file.filename,
    forceDownload: true,
  });

  if (planTier === "PRO") {
    // Pro downloads redirect straight to B2. The app never sees the bytes again after
    // this response, so there's no way to meter actual usage. Charge the full size upfront.
    await consumeDownloadQuota(identifier, fileBytes);
    return NextResponse.redirect(url);
  }

  // Free/anonymous downloads are proxied through /api/stream, which can see real bytes
  // as they're sent. Quota is charged incrementally there instead of upfront here, so
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
