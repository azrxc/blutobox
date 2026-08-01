export type UploadProgress = (fraction: number) => void;

export type UploadOptions = {
  isNsfw: boolean;
  linkPassword?: string;
  expiresInHours?: number;
};

const MULTIPART_CONCURRENCY = 5;

function putWithProgress(
  url: string,
  body: Blob,
  contentType: string,
  onProgress: (loaded: number) => void
): Promise<string | null> {
  return new Promise((resolve, reject) => {
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
    xhr.send(body);
  });
}

async function uploadPartsConcurrently(
  file: File,
  partUrls: string[],
  partSize: number,
  onProgress: (loaded: number) => void
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
      const i = nextIndex++;
      const start = i * partSize;
      const end = Math.min(start + partSize, file.size);
      const chunk = file.slice(start, end);
      const etag = await putWithProgress(partUrls[i], chunk, contentType, (loaded) => {
        partBytesLoaded[i] = loaded;
        reportProgress();
      });
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
  onProgress: UploadProgress
): Promise<{ slug: string }> {
  const presignRes = await fetch("/api/uploads/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name, size: file.size, mimeType: file.type || "application/octet-stream" }),
  });

  if (!presignRes.ok) {
    const data = await presignRes.json().catch(() => ({}));
    throw new Error(data.error ?? "Failed to start upload");
  }

  const presign = await presignRes.json();

  const completeBody = {
    key: presign.key,
    filename: file.name,
    size: file.size,
    mimeType: file.type || "application/octet-stream",
    isNsfw: options.isNsfw,
    linkPassword: options.linkPassword || undefined,
    expiresInHours: options.expiresInHours,
  };

  if (presign.type === "single") {
    await putWithProgress(presign.uploadUrl, file, file.type || "application/octet-stream", (loaded) => {
      onProgress(loaded / file.size);
    });
  } else {
    const partSize: number = presign.partSize;
    const partUrls: string[] = presign.partUrls;

    const parts = await uploadPartsConcurrently(file, partUrls, partSize, (loaded) => {
      onProgress(loaded / file.size);
    });

    const completeRes = await fetch("/api/uploads/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...completeBody, uploadId: presign.uploadId, parts }),
    });
    if (!completeRes.ok) {
      const data = await completeRes.json().catch(() => ({}));
      throw new Error(data.error ?? "Failed to finalize upload");
    }
    return completeRes.json();
  }

  const completeRes = await fetch("/api/uploads/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(completeBody),
  });
  if (!completeRes.ok) {
    const data = await completeRes.json().catch(() => ({}));
    throw new Error(data.error ?? "Failed to finalize upload");
  }
  return completeRes.json();
}
