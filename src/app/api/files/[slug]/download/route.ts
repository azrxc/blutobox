import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSignedDownloadUrl } from "@/lib/storage";
import { unlockCookieName, verifyUnlockToken } from "@/lib/link-lock";

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

  await prisma.file.update({
    where: { id: link.file.id },
    data: { downloadCount: { increment: 1 }, lastAccessedAt: new Date() },
  });

  const url = await getSignedDownloadUrl(link.file.b2Key, {
    filename: link.file.filename,
    forceDownload: true,
  });

  return NextResponse.redirect(url);
}
