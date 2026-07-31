import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const reportSchema = z.object({
  slug: z.string().min(1),
  reason: z.string().min(10).max(2000),
  reporterEmail: z.string().email(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please provide a valid email and a reason (at least 10 characters)" },
      { status: 400 }
    );
  }
  const { slug, reason, reporterEmail } = parsed.data;

  const link = await prisma.shareLink.findUnique({ where: { slug } });
  if (!link) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  await prisma.report.create({
    data: { fileId: link.fileId, reason, reporterEmail },
  });

  return NextResponse.json({ ok: true });
}
