import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import { checkForgotPasswordLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";

const schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const { success } = await checkForgotPasswordLimit(ip);
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests from this network. Please try again later." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please enter a valid email" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (user && !user.banned && !user.emailVerified) {
    await prisma.verificationToken.deleteMany({ where: { userId: user.id } });
    const token = randomBytes(32).toString("hex");
    await prisma.verificationToken.create({
      data: { token, userId: user.id, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
    });
    sendVerificationEmail(user.email, token).catch(() => {});
  }

  // Always respond the same way regardless of account state, to avoid leaking who has an account.
  return NextResponse.json({ ok: true });
}
