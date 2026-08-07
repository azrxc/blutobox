import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentPlanTier } from "@/lib/plan";

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

const brandingSchema = z.object({
  message: z.string().trim().max(140).nullable(),
  color: z
    .string()
    .trim()
    .regex(HEX_COLOR, "Color must be a 6-digit hex code like #3b82f6")
    .nullable(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "You must be logged in" }, { status: 401 });
  }

  const planTier = await getCurrentPlanTier(session.user.id);
  if (planTier !== "PRO") {
    return NextResponse.json({ error: "Custom branding is a Pro feature" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = brandingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid branding" },
      { status: 400 }
    );
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      brandMessage: parsed.data.message || null,
      brandColor: parsed.data.color || null,
    },
  });

  return NextResponse.json({ ok: true });
}
