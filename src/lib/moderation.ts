import { prisma } from "@/lib/prisma";

const REPEAT_OFFENDER_THRESHOLD = 3;

export async function removeFileAndCheckRepeatOffender(fileId: string) {
  const file = await prisma.file.update({
    where: { id: fileId },
    data: { status: "REMOVED" },
  });

  const ipRemovedCount = await prisma.file.count({
    where: { uploaderIp: file.uploaderIp, status: "REMOVED" },
  });

  if (ipRemovedCount >= REPEAT_OFFENDER_THRESHOLD) {
    await prisma.bannedIp.upsert({
      where: { ip: file.uploaderIp },
      create: { ip: file.uploaderIp, reason: `${ipRemovedCount} files removed after reports` },
      update: {},
    });
  }

  if (file.ownerId) {
    const ownerRemovedCount = await prisma.file.count({
      where: { ownerId: file.ownerId, status: "REMOVED" },
    });
    if (ownerRemovedCount >= REPEAT_OFFENDER_THRESHOLD) {
      await prisma.user.update({
        where: { id: file.ownerId },
        data: { banned: true },
      });
    }
  }

  return file;
}
