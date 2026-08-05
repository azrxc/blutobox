import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentPlanTier } from "@/lib/plan";
import { maxBookmarksFor } from "@/lib/limits";

const schema = z.object({ slug: z.string().min(1) });

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "You must be logged in" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const link = await prisma.shareLink.findUnique({
    where: { slug: parsed.data.slug },
    include: { file: true },
  });
  if (!link || link.file.status !== "ACTIVE") {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const planTier = (await getCurrentPlanTier(session.user.id)) ?? "FREE";
  const max = maxBookmarksFor(planTier);
  const count = await prisma.bookmark.count({ where: { userId: session.user.id } });
  if (count >= max) {
    return NextResponse.json(
      { error: `You've reached your bookmark limit (${max}). Upgrade to Pro for unlimited bookmarks.` },
      { status: 403 }
    );
  }

  await prisma.bookmark.upsert({
    where: { userId_shareLinkId: { userId: session.user.id, shareLinkId: link.id } },
    create: { userId: session.user.id, shareLinkId: link.id },
    update: {},
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "You must be logged in" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const link = await prisma.shareLink.findUnique({ where: { slug: parsed.data.slug } });
  if (link) {
    await prisma.bookmark.deleteMany({ where: { userId: session.user.id, shareLinkId: link.id } });
  }

  return NextResponse.json({ ok: true });
}
