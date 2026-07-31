export type UploadProgress = (fraction: number) => void;

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

export async function uploadFile(
  file: File,
  isNsfw: boolean,
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
  let uploaded = 0;

  if (presign.type === "single") {
    await putWithProgress(presign.uploadUrl, file, file.type || "application/octet-stream", (loaded) => {
      onProgress(loaded / file.size);
    });
  } else {
    const parts: { ETag: string; PartNumber: number }[] = [];
    const partSize: number = presign.partSize;
    const partUrls: string[] = presign.partUrls;

    for (let i = 0; i < partUrls.length; i++) {
      const start = i * partSize;
      const end = Math.min(start + partSize, file.size);
      const chunk = file.slice(start, end);
      const etag = await putWithProgress(partUrls[i], chunk, file.type || "application/octet-stream", (loaded) => {
        onProgress((uploaded + loaded) / file.size);
      });
      uploaded += chunk.size;
      if (!etag) throw new Error("Upload part missing ETag");
      parts.push({ ETag: etag, PartNumber: i + 1 });
    }

    const completeRes = await fetch("/api/uploads/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: presign.key,
        filename: file.name,
        size: file.size,
        mimeType: file.type || "application/octet-stream",
        isNsfw,
        uploadId: presign.uploadId,
        parts,
      }),
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
    body: JSON.stringify({
      key: presign.key,
      filename: file.name,
      size: file.size,
      mimeType: file.type || "application/octet-stream",
      isNsfw,
    }),
  });
  if (!completeRes.ok) {
    const data = await completeRes.json().catch(() => ({}));
    throw new Error(data.error ?? "Failed to finalize upload");
  }
  return completeRes.json();
}
