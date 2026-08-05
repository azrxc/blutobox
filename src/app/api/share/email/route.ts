import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getClientIp } from "@/lib/request-ip";
import { checkShareEmailLimit } from "@/lib/rate-limit";
import { sendShareLinkEmail } from "@/lib/email";

const shareEmailSchema = z.object({
  slug: z.string().min(1),
  recipientEmail: z.string().email(),
  message: z.string().max(500).optional(),
});

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const { success } = await checkShareEmailLimit(ip);
  if (!success) {
    return NextResponse.json(
      { error: "Too many emails sent from this network. Try again later." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = shareEmailSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please provide a valid recipient email" }, { status: 400 });
  }

  const { slug, recipientEmail, message } = parsed.data;

  const link = await prisma.shareLink.findUnique({ where: { slug }, include: { file: true } });
  if (!link || link.file.status !== "ACTIVE") {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
  if (link.expiresAt && link.expiresAt < new Date()) {
    return NextResponse.json({ error: "This link has expired" }, { status: 410 });
  }

  const session = await auth();
  const fileUrl = `${process.env.NEXTAUTH_URL}/f/${slug}`;
  // Same privacy rule as OG previews - don't leak the real filename for NSFW content.
  const displayFilename = link.file.isNsfw ? "a file" : link.file.filename;

  try {
    await sendShareLinkEmail({
      recipientEmail,
      fileUrl,
      filename: displayFilename,
      senderName: session?.user?.name ?? undefined,
      message,
    });
  } catch {
    return NextResponse.json({ error: "Failed to send email. Try again later." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
