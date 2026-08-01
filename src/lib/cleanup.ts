import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "@/lib/prisma";
import { getS3Client, B2_BUCKET } from "@/lib/storage";

export const INACTIVITY_DAYS = 30;

export async function deleteInactiveFreeFiles() {
  const cutoff = new Date(Date.now() - INACTIVITY_DAYS * 24 * 60 * 60 * 1000);

  const staleFiles = await prisma.file.findMany({
    where: {
      status: "ACTIVE",
      lastAccessedAt: { lt: cutoff },
      OR: [{ owner: null }, { owner: { planTier: "FREE" } }],
    },
    select: { id: true, b2Key: true, ownerId: true, sizeBytes: true },
  });

  if (staleFiles.length === 0) {
    return { deleted: 0 };
  }

  const s3 = getS3Client();
  const bucket = B2_BUCKET();

  for (const file of staleFiles) {
    try {
      await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: file.b2Key }));
    } catch (err) {
      console.error(`[cleanup] Failed to delete B2 object ${file.b2Key}:`, err);
      continue;
    }
    await prisma.shareLink.deleteMany({ where: { fileId: file.id } });
    await prisma.report.deleteMany({ where: { fileId: file.id } });
    await prisma.file.delete({ where: { id: file.id } });
    if (file.ownerId) {
      await prisma.user.update({
        where: { id: file.ownerId },
        data: { storageUsedBytes: { decrement: file.sizeBytes } },
      });
    }
  }

  return { deleted: staleFiles.length };
}
