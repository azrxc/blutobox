import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentPlanTier } from "@/lib/plan";

const MAX_LINKS = 5;

const schema = z.object({
  links: z
    .array(
      z.object({
        label: z.string().trim().min(1).max(50),
        url: z.string().trim().url().max(300),
      })
    )
    .max(MAX_LINKS),
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
    return NextResponse.json(
      { error: `Each link needs a name and a valid URL (max ${MAX_LINKS} links)` },
      { status: 400 }
    );
  }

  await prisma.$transaction([
    prisma.creatorLink.deleteMany({ where: { userId: session.user.id } }),
    prisma.creatorLink.createMany({
      data: parsed.data.links.map((link, i) => ({
        userId: session.user.id,
        label: link.label,
        url: link.url,
        order: i,
      })),
    }),
  ]);

  return NextResponse.json({ ok: true });
}
