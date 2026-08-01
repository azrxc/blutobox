import { NextResponse } from "next/server";
import { z } from "zod";
import { AbortMultipartUploadCommand } from "@aws-sdk/client-s3";
import { getS3Client, B2_BUCKET } from "@/lib/storage";

const abortSchema = z.object({
  key: z.string().min(1),
  uploadId: z.string().min(1),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = abortSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    await getS3Client().send(
      new AbortMultipartUploadCommand({
        Bucket: B2_BUCKET(),
        Key: parsed.data.key,
        UploadId: parsed.data.uploadId,
      })
    );
  } catch {
    // Best-effort cleanup - nothing the client can do if this fails, B2 will
    // eventually garbage-collect abandoned multipart uploads on its own.
  }

  return NextResponse.json({ ok: true });
}
