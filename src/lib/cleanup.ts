import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "@/lib/prisma";
import { getS3Client, B2_BUCKET } from "@/lib/storage";
import { sendDeletionWarningEmail } from "@/lib/email";

export const FREE_INACTIVITY_DAYS = 30;
export const ANON_INACTIVITY_DAYS = 7;
export const WARNING_DAYS_BEFORE_DELETION = 3;

// A user on a currently-active day/week pass shouldn't be treated as "Free" here even
// though their base planTier still says FREE - same effective-tier logic as everywhere
// else, just expressed as a query filter instead of the in-app helper.
const notCurrentlyProViaPass = { OR: [{ proPassExpiresAt: null }, { proPassExpiresAt: { lt: new Date() } }] };

export async function warnUsersOfUpcomingDeletion() {
  const deletionCutoff = new Date(Date.now() - FREE_INACTIVITY_DAYS * 24 * 60 * 60 * 1000);
  const warningCutoff = new Date(
    Date.now() - (FREE_INACTIVITY_DAYS - WARNING_DAYS_BEFORE_DELETION) * 24 * 60 * 60 * 1000
  );

  const filesToWarn = await prisma.file.findMany({
    where: {
      status: "ACTIVE",
      deletionWarningSentAt: null,
      lastAccessedAt: { lt: warningCutoff, gte: deletionCutoff },
      owner: { planTier: "FREE", ...notCurrentlyProViaPass },
    },
    include: { owner: true, shareLinks: { take: 1 } },
  });

  let warned = 0;
  for (const file of filesToWarn) {
    const slug = file.shareLinks[0]?.slug;
    if (!file.owner || !slug) continue;
    try {
      await sendDeletionWarningEmail(file.owner.email, file.filename, slug);
    } catch (err) {
      console.error(`[cleanup] Failed to send deletion warning for file ${file.id}:`, err);
      continue;
    }
    await prisma.file.update({
      where: { id: file.id },
      data: { deletionWarningSentAt: new Date() },
    });
    warned++;
  }

  return { warned };
}

export async function deleteInactiveFreeFiles() {
  const anonCutoff = new Date(Date.now() - ANON_INACTIVITY_DAYS * 24 * 60 * 60 * 1000);
  const freeCutoff = new Date(Date.now() - FREE_INACTIVITY_DAYS * 24 * 60 * 60 * 1000);

  const staleFiles = await prisma.file.findMany({
    where: {
      status: "ACTIVE",
      OR: [
        { ownerId: null, lastAccessedAt: { lt: anonCutoff } },
        { owner: { planTier: "FREE", ...notCurrentlyProViaPass }, lastAccessedAt: { lt: freeCutoff } },
      ],
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
