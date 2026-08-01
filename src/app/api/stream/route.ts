import { verifyStreamToken } from "@/lib/stream-token";

export const runtime = "edge";

const THROTTLE_BYTES_PER_SEC = 8 * 1024 * 1024; // 8 MB/s for Free/anonymous downloads

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

  const reader = upstream.body.getReader();
  const startTime = Date.now();
  let bytesSent = 0;

  const stream = new ReadableStream({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) {
        controller.close();
        return;
      }
      controller.enqueue(value);
      bytesSent += value.byteLength;

      const expectedElapsedMs = (bytesSent / THROTTLE_BYTES_PER_SEC) * 1000;
      const actualElapsedMs = Date.now() - startTime;
      const waitMs = expectedElapsedMs - actualElapsedMs;
      if (waitMs > 20) {
        await new Promise((resolve) => setTimeout(resolve, waitMs));
      }
    },
    cancel() {
      reader.cancel();
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
