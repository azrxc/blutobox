import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export function getS3Client() {
  return new S3Client({
    endpoint: `https://${required("B2_ENDPOINT")}`,
    region: required("B2_REGION"),
    credentials: {
      accessKeyId: required("B2_ACCOUNT_ID"),
      secretAccessKey: required("B2_APPLICATION_KEY"),
    },
  });
}

export const B2_BUCKET = () => required("B2_BUCKET_NAME");

export async function getSignedDownloadUrl(
  key: string,
  options?: { filename?: string; forceDownload?: boolean }
) {
  const s3 = getS3Client();
  const command = new GetObjectCommand({
    Bucket: B2_BUCKET(),
    Key: key,
    ResponseContentDisposition: options?.forceDownload
      ? `attachment; filename="${(options.filename ?? "file").replace(/"/g, "")}"`
      : undefined,
  });
  return getSignedUrl(s3, command, { expiresIn: 3600 });
}
