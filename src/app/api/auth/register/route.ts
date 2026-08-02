import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import { checkRegisterLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";

const registerSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(200),
  ref: z.string().optional(),
});

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const { success } = await checkRegisterLimit(ip);
  if (!success) {
    return NextResponse.json(
      { error: "Too many accounts created from this network. Please try again later." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please enter your name, a valid email, and a password (min 8 characters)" }, { status: 400 });
  }

  const { name, email, password, ref } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "An account with that email already exists" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const referrer = ref ? await prisma.user.findUnique({ where: { id: ref }, select: { id: true } }) : null;

  const user = await prisma.user.create({
    data: { name, email, passwordHash, referredById: referrer?.id },
  });

  const token = randomBytes(32).toString("hex");
  await prisma.verificationToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  let emailSent = true;
  try {
    await sendVerificationEmail(email, token);
  } catch {
    emailSent = false;
  }

  return NextResponse.json({ ok: true, emailSent });
}
