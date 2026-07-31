import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { removeFileAndCheckRepeatOffender } from "@/lib/moderation";

const actionSchema = z.object({
  action: z.enum(["remove", "dismiss"]),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const report = await prisma.report.findUnique({ where: { id } });
  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  if (parsed.data.action === "remove") {
    await removeFileAndCheckRepeatOffender(report.fileId);
    await prisma.report.update({ where: { id }, data: { status: "REMOVED" } });
  } else {
    await prisma.report.update({ where: { id }, data: { status: "REVIEWED" } });
  }

  return NextResponse.json({ ok: true });
}
