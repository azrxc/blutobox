import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentPlanTier } from "@/lib/plan";
import { maxCreatorLinksFor } from "@/lib/limits";

const linkSchema = z.object({
  label: z.string().trim().min(1).max(50),
  url: z.string().trim().url().max(300),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "You must be logged in" }, { status: 401 });
  }

  const [planTier, user] = await Promise.all([
    getCurrentPlanTier(session.user.id).then((t) => t ?? "FREE"),
    prisma.user.findUnique({ where: { id: session.user.id }, select: { bonusCreatorLinks: true } }),
  ]);
  const maxLinks = maxCreatorLinksFor(planTier, user?.bonusCreatorLinks ?? 0);

  const body = await req.json().catch(() => null);
  const parsed = z.object({ links: z.array(linkSchema).max(maxLinks) }).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: `Each link needs a name and a valid URL (max ${maxLinks} link${maxLinks === 1 ? "" : "s"})` },
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
