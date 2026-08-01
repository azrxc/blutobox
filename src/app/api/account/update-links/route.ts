import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentPlanTier } from "@/lib/plan";

const urlField = z.string().trim().url().max(300).optional().or(z.literal(""));

const schema = z.object({
  discordUrl: urlField,
  youtubeUrl: urlField,
  supportUrl: urlField,
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "You must be logged in" }, { status: 401 });
  }

  const isPro = (await getCurrentPlanTier(session.user.id)) === "PRO";
  if (!isPro) {
    return NextResponse.json({ error: "This is a Pro feature" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please enter valid URLs" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      discordUrl: parsed.data.discordUrl || null,
      youtubeUrl: parsed.data.youtubeUrl || null,
      supportUrl: parsed.data.supportUrl || null,
    },
  });

  return NextResponse.json({ ok: true });
}
