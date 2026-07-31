import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { CompleteMultipartUploadCommand } from "@aws-sdk/client-s3";
import { getS3Client, B2_BUCKET } from "@/lib/storage";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/slug";
import { getClientIp } from "@/lib/request-ip";

const completeSchema = z.object({
  key: z.string().min(1),
  filename: z.string().min(1).max(500),
  size: z.number().int().positive(),
  mimeType: z.string().min(1).max(200),
  isNsfw: z.boolean().default(false),
  uploadId: z.string().optional(),
  parts: z
    .array(z.object({ ETag: z.string(), PartNumber: z.number() }))
    .optional(),
  linkPassword: z.string().min(1).max(100).optional(),
  expiresInHours: z.number().int().positive().max(24 * 365).optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = completeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid completion request" }, { status: 400 });
  }
  const { key, filename, size, mimeType, isNsfw, uploadId, parts, linkPassword, expiresInHours } = parsed.data;

  if (uploadId) {
    if (!parts || parts.length === 0) {
      return NextResponse.json({ error: "Missing parts for multipart upload" }, { status: 400 });
    }
    const s3 = getS3Client();
    await s3.send(
      new CompleteMultipartUploadCommand({
        Bucket: B2_BUCKET(),
        Key: key,
        UploadId: uploadId,
        MultipartUpload: { Parts: parts },
      })
    );
  }

  const session = await auth();
  const ip = getClientIp(req);

  const file = await prisma.file.create({
    data: {
      ownerId: session?.user?.id ?? null,
      uploaderIp: ip,
      filename,
      sizeBytes: BigInt(size),
      mimeType,
      b2Key: key,
      isNsfw,
    },
  });

  const isPro = session?.user?.planTier === "PRO";
  const passwordHash = isPro && linkPassword ? await bcrypt.hash(linkPassword, 12) : null;
  const expiresAt = isPro && expiresInHours
    ? new Date(Date.now() + expiresInHours * 60 * 60 * 1000)
    : null;

  const slug = generateSlug();
  await prisma.shareLink.create({
    data: { fileId: file.id, slug, passwordHash, expiresAt },
  });

  if (session?.user?.id) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { storageUsedBytes: { increment: BigInt(size) } },
    });
  }

  return NextResponse.json({ ok: true, slug, fileId: file.id });
}
