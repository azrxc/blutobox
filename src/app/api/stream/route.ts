import { verifyStreamToken } from "@/lib/stream-token";
import { consumeDownloadQuota } from "@/lib/download-quota";

export const runtime = "edge";

const THROTTLE_BYTES_PER_SEC = 8 * 1024 * 1024; // 8 MB/s for Free/anonymous downloads
const QUOTA_FLUSH_BYTES = 4 * 1024 * 1024; // batch quota writes so we're not hitting Redis every chunk

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("t");
  if (!token) {
    return new Response("Missing token", { status: 400 });
  }

  const payload = await verifyStreamToken(token);
  if (!payload) {
    return new Response("Invalid or expired link", { status: 403 });
  }

  const upstream = await fetch(payload.url);
  if (!upstream.ok || !upstream.body) {
    return new Response("Failed to fetch file", { status: 502 });
  }

  const identifier = payload.identifier;
  const reader = upstream.body.getReader();
  const startTime = Date.now();
  let bytesSent = 0;
  let unflushed = 0;

  async function flushQuota() {
    if (unflushed === 0) return;
    const amount = unflushed;
    unflushed = 0;
    await consumeDownloadQuota(identifier, amount).catch(() => {});
  }

  const stream = new ReadableStream({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) {
        await flushQuota();
        controller.close();
        return;
      }
      controller.enqueue(value);
      bytesSent += value.byteLength;
      unflushed += value.byteLength;

      // Actual bytes sent count against quota as they go out, not upfront — so a
      // cancelled download only ever charges for what was actually transferred.
      if (unflushed >= QUOTA_FLUSH_BYTES) {
        await flushQuota();
      }

      const expectedElapsedMs = (bytesSent / THROTTLE_BYTES_PER_SEC) * 1000;
      const actualElapsedMs = Date.now() - startTime;
      const waitMs = expectedElapsedMs - actualElapsedMs;
      if (waitMs > 20) {
        await new Promise((resolve) => setTimeout(resolve, waitMs));
      }
    },
    async cancel() {
      reader.cancel();
      await flushQuota();
    },
  });

  const headers = new Headers();
  headers.set("Content-Type", upstream.headers.get("content-type") ?? "application/octet-stream");
  const contentLength = upstream.headers.get("content-length");
  if (contentLength) headers.set("Content-Length", contentLength);
  headers.set(
    "Content-Disposition",
    `attachment; filename="${payload.filename.replace(/"/g, "")}"`
  );

  return new Response(stream, { status: 200, headers });
}
