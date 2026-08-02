import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { grantReferralBonus } from "@/lib/referral";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const record = await prisma.verificationToken.findUnique({ where: { token } });
  if (!record || record.expiresAt < new Date()) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }

  const [verifiedUser] = await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerified: new Date() },
    }),
    prisma.verificationToken.delete({ where: { token } }),
  ]);

  if (verifiedUser.referredById) {
    await grantReferralBonus(verifiedUser.referredById, verifiedUser.id).catch(() => {});
  }

  return NextResponse.redirect(new URL("/login?verified=1", req.url));
}
