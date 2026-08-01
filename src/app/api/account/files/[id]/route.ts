import { NextResponse } from "next/server";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getS3Client, B2_BUCKET } from "@/lib/storage";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "You must be logged in" }, { status: 401 });
  }

  const { id } = await params;
  const file = await prisma.file.findUnique({ where: { id } });
  if (!file || file.ownerId !== session.user.id) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const s3 = getS3Client();
  await s3.send(new DeleteObjectCommand({ Bucket: B2_BUCKET(), Key: file.b2Key }));

  await prisma.shareLink.deleteMany({ where: { fileId: file.id } });
  await prisma.report.deleteMany({ where: { fileId: file.id } });
  await prisma.file.delete({ where: { id: file.id } });

  if (file.ownerId) {
    await prisma.user.update({
      where: { id: file.ownerId },
      data: { storageUsedBytes: { decrement: file.sizeBytes } },
    });
  }

  return NextResponse.json({ ok: true });
}
