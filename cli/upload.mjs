#!/usr/bin/env node
// Bluto Box CLI upload - anonymous upload via the same public API the browser uses,
// same limits as uploading without an account (200MB max, 10 uploads/hour per IP).
// Usage: node cli/upload.mjs <file>

import { readFile, stat } from "fs/promises";
import { basename } from "path";

const BASE_URL = process.env.BLUTO_URL || "https://blutobox.com";
const MULTIPART_CONCURRENCY = 5;

async function throwForResponse(res, fallback) {
  const data = await res.json().catch(() => null);
  throw new Error(data?.error ?? `${fallback} (status ${res.status})`);
}

async function uploadPart(url, chunk) {
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/octet-stream" },
    body: chunk,
  });
  if (!res.ok) throw new Error(`Upload part failed with status ${res.status}`);
  const etag = res.headers.get("ETag");
  if (!etag) throw new Error("Upload part missing ETag");
  return etag;
}

async function uploadPartsConcurrently(buffer, partUrls, partSize) {
  const results = new Array(partUrls.length);
  let nextIndex = 0;
  async function worker() {
    while (nextIndex < partUrls.length) {
      const i = nextIndex++;
      const start = i * partSize;
      const chunk = buffer.subarray(start, Math.min(start + partSize, buffer.length));
      results[i] = { ETag: await uploadPart(partUrls[i], chunk), PartNumber: i + 1 };
    }
  }
  await Promise.all(Array.from({ length: Math.min(MULTIPART_CONCURRENCY, partUrls.length) }, worker));
  return results;
}

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("Usage: node cli/upload.mjs <file>");
    process.exit(1);
  }

  const fileStat = await stat(filePath);
  const buffer = await readFile(filePath);
  const filename = basename(filePath);
  const mimeType = "application/octet-stream";

  const presignRes = await fetch(`${BASE_URL}/api/uploads/presign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename, size: fileStat.size, mimeType }),
  });
  if (!presignRes.ok) await throwForResponse(presignRes, "Failed to start upload");
  const presign = await presignRes.json();

  let completeBody = { key: presign.key, filename, size: fileStat.size, mimeType };

  if (presign.type === "single") {
    const putRes = await fetch(presign.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": mimeType },
      body: buffer,
    });
    if (!putRes.ok) throw new Error(`Upload failed with status ${putRes.status}`);
  } else {
    const parts = await uploadPartsConcurrently(buffer, presign.partUrls, presign.partSize);
    completeBody = { ...completeBody, uploadId: presign.uploadId, parts };
  }

  const completeRes = await fetch(`${BASE_URL}/api/uploads/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(completeBody),
  });
  if (!completeRes.ok) await throwForResponse(completeRes, "Failed to finalize upload");
  const { slug } = await completeRes.json();
  console.log(`${BASE_URL}/f/${slug}`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
