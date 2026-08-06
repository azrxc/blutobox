export type UploadProgress = (fraction: number) => void;

export type UploadOptions = {
  isNsfw: boolean;
  linkPassword?: string;
  expiresInHours?: number;
  notifyOnDownload?: boolean;
  maxDownloads?: number;
};

export class UploadCancelledError extends Error {
  constructor() {
    super("Upload cancelled");
    this.name = "UploadCancelledError";
  }
}

const MULTIPART_CONCURRENCY = 5;

async function hashFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function throwForResponse(res: Response, fallback: string): Promise<never> {
  const data = await res.json().catch(() => null);
  throw new Error(data?.error ?? `${fallback} (status ${res.status})`);
}

function putWithProgress(
  url: string,
  body: Blob,
  contentType: string,
  onProgress: (loaded: number) => void,
  signal: AbortSignal
): Promise<string | null> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new UploadCancelledError());
      return;
    }
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(e.loaded);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.getResponseHeader("ETag"));
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.onabort = () => reject(new UploadCancelledError());
    const onSignalAbort = () => xhr.abort();
    signal.addEventListener("abort", onSignalAbort);
    xhr.send(body);
  });
}

async function uploadPartsConcurrently(
  file: File,
  partUrls: string[],
  partSize: number,
  onProgress: (loaded: number) => void,
  signal: AbortSignal
): Promise<{ ETag: string; PartNumber: number }[]> {
  const partBytesLoaded = new Array(partUrls.length).fill(0);
  const results: { ETag: string; PartNumber: number }[] = new Array(partUrls.length);
  const contentType = file.type || "application/octet-stream";

  function reportProgress() {
    onProgress(partBytesLoaded.reduce((a, b) => a + b, 0));
  }

  let nextIndex = 0;
  async function worker() {
    while (nextIndex < partUrls.length) {
      if (signal.aborted) throw new UploadCancelledError();
      const i = nextIndex++;
      const start = i * partSize;
      const end = Math.min(start + partSize, file.size);
      const chunk = file.slice(start, end);
      const etag = await putWithProgress(
        partUrls[i],
        chunk,
        contentType,
        (loaded) => {
          partBytesLoaded[i] = loaded;
          reportProgress();
        },
        signal
      );
      if (!etag) throw new Error("Upload part missing ETag");
      partBytesLoaded[i] = chunk.size;
      reportProgress();
      results[i] = { ETag: etag, PartNumber: i + 1 };
    }
  }

  const workers = Array.from({ length: Math.min(MULTIPART_CONCURRENCY, partUrls.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

export async function uploadFile(
  file: File,
  options: UploadOptions,
  onProgress: UploadProgress,
  signal: AbortSignal
): Promise<{ slug: string }> {
  const presignRes = await fetch("/api/uploads/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name, size: file.size, mimeType: file.type || "application/octet-stream" }),
    signal,
  });

  if (!presignRes.ok) {
    await throwForResponse(presignRes, "Failed to start upload");
  }

  const presign = await presignRes.json();
  const hashPromise = hashFile(file).catch(() => undefined);

  const completeBody = {
    key: presign.key,
    filename: file.name,
    size: file.size,
    mimeType: file.type || "application/octet-stream",
    isNsfw: options.isNsfw,
    linkPassword: options.linkPassword || undefined,
    expiresInHours: options.expiresInHours,
    notifyOnDownload: options.notifyOnDownload ?? false,
    maxDownloads: options.maxDownloads,
  };

  try {
    if (presign.type === "single") {
      await putWithProgress(
        presign.uploadUrl,
        file,
        file.type || "application/octet-stream",
        (loaded) => onProgress(loaded / file.size),
        signal
      );
    } else {
      const partSize: number = presign.partSize;
      const partUrls: string[] = presign.partUrls;

      const parts = await uploadPartsConcurrently(
        file,
        partUrls,
        partSize,
        (loaded) => onProgress(loaded / file.size),
        signal
      );

      const completeRes = await fetch("/api/uploads/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...completeBody, uploadId: presign.uploadId, parts, sha256: await hashPromise }),
        signal,
      });
      if (!completeRes.ok) {
        await throwForResponse(completeRes, "Failed to finalize upload");
      }
      return completeRes.json();
    }
  } catch (err) {
    if (presign.type === "multipart" && (err instanceof UploadCancelledError || signal.aborted)) {
      fetch("/api/uploads/abort", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: presign.key, uploadId: presign.uploadId }),
        keepalive: true,
      }).catch(() => {});
    }
    if (signal.aborted && !(err instanceof UploadCancelledError)) {
      throw new UploadCancelledError();
    }
    throw err;
  }

  const completeRes = await fetch("/api/uploads/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...completeBody, sha256: await hashPromise }),
    signal,
  });
  if (!completeRes.ok) {
    await throwForResponse(completeRes, "Failed to finalize upload");
  }
  return completeRes.json();
}
