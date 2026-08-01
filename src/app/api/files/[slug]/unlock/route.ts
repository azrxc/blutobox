import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { makeUnlockToken, unlockCookieName } from "@/lib/link-lock";
import { checkUnlockLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";

const unlockSchema = z.object({ password: z.string().min(1) });

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const ip = getClientIp(req);
  const { success } = await checkUnlockLimit(ip);
  if (!success) {
    return NextResponse.json(
      { error: "Too many attempts from this network. Please try again later." },
      { status: 429 }
    );
  }

  const { slug } = await params;
  const body = await req.json().catch(() => null);
  const parsed = unlockSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Password required" }, { status: 400 });
  }

  const link = await prisma.shareLink.findUnique({ where: { slug } });
  if (!link || !link.passwordHash) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const valid = await bcrypt.compare(parsed.data.password, link.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 403 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(unlockCookieName(slug), makeUnlockToken(slug), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 6,
  });
  return res;
}
