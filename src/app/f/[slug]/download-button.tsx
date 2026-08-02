"use client";

import { useState } from "react";
import { LoadingIcon } from "../../loading-icon";

export function DownloadButton({
  slug,
  filename,
  sizeBytes,
}: {
  slug: string;
  filename: string;
  sizeBytes: number;
}) {
  const [progress, setProgress] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setError(null);
    setDownloading(true);
    setProgress(0);
    try {
      const res = await fetch(`/api/files/${slug}/download`);
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? `Download failed (status ${res.status})`);
      }

      const reader = res.body.getReader();
      const chunks: Uint8Array[] = [];
      let loaded = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        loaded += value.byteLength;
        if (sizeBytes > 0) setProgress(Math.min(loaded / sizeBytes, 1));
      }

      const blob = new Blob(chunks as BlobPart[]);
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Download failed");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-2">
      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {downloading && (
        <div className="flex items-center gap-3">
          <LoadingIcon size={32} />
          <div className="h-1.5 w-48 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
        </div>
      )}
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-85 disabled:opacity-60"
      >
        {downloading ? `Downloading… ${Math.round(progress * 100)}%` : "Download"}
      </button>
    </div>
  );
}
