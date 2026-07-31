import { NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "crypto";
import {
  PutObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getS3Client, B2_BUCKET } from "@/lib/storage";
import { auth } from "@/lib/auth";
import {
  maxUploadBytesFor,
  MULTIPART_THRESHOLD_BYTES,
  MULTIPART_PART_SIZE_BYTES,
} from "@/lib/limits";
import { getClientIp } from "@/lib/request-ip";

const presignSchema = z.object({
  filename: z.string().min(1).max(500),
  size: z.number().int().positive(),
  mimeType: z.string().min(1).max(200),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = presignSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid upload request" }, { status: 400 });
  }
  const { filename, size, mimeType } = parsed.data;

  const session = await auth();
  const planTier = (session?.user?.planTier as "FREE" | "PRO" | undefined) ?? null;

  const maxBytes = maxUploadBytesFor(planTier);
  if (size > maxBytes) {
    return NextResponse.json(
      { error: `File too large. Max allowed is ${Math.floor(maxBytes / (1024 * 1024))}MB for your plan.` },
      { status: 413 }
    );
  }

  const ip = getClientIp(req);
  const key = `uploads/${randomUUID()}/${filename}`;
  const s3 = getS3Client();
  const bucket = B2_BUCKET();

  if (size <= MULTIPART_THRESHOLD_BYTES) {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: mimeType,
    });
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    return NextResponse.json({
      type: "single",
      key,
      uploadUrl,
      uploaderIp: ip,
    });
  }

  const created = await s3.send(
    new CreateMultipartUploadCommand({
      Bucket: bucket,
      Key: key,
      ContentType: mimeType,
    })
  );

  const partCount = Math.ceil(size / MULTIPART_PART_SIZE_BYTES);
  const partUrls = await Promise.all(
    Array.from({ length: partCount }, (_, i) =>
      getSignedUrl(
        s3,
        new UploadPartCommand({
          Bucket: bucket,
          Key: key,
          UploadId: created.UploadId,
          PartNumber: i + 1,
        }),
        { expiresIn: 3600 }
      )
    )
  );

  return NextResponse.json({
    type: "multipart",
    key,
    uploadId: created.UploadId,
    partSize: MULTIPART_PART_SIZE_BYTES,
    partUrls,
    uploaderIp: ip,
  });
}
