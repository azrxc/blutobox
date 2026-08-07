"use client";

import { useRef, useState } from "react";

export function DownloadButton({
  slug,
  filename,
  sizeBytes,
  accentColor,
}: {
  slug: string;
  filename: string;
  sizeBytes: number;
  accentColor?: string | null;
}) {
  const accentStyle = accentColor ? { backgroundColor: accentColor } : undefined;
  const [progress, setProgress] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  async function handleDownload() {
    setError(null);
    setDownloading(true);
    setProgress(0);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch(`/api/files/${slug}/download`, { signal: controller.signal });
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
      if (!(e instanceof DOMException && e.name === "AbortError")) {
        setError(e instanceof Error ? e.message : "Download failed");
      }
    } finally {
      setDownloading(false);
      abortRef.current = null;
    }
  }

  function handleCancel() {
    abortRef.current?.abort();
  }

  return (
    <div className="space-y-2">
      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {downloading && (
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${Math.round(progress * 100)}%`, ...accentStyle }}
            />
          </div>
          <button
            onClick={handleCancel}
            className="text-xs text-muted underline underline-offset-2 hover:text-foreground"
          >
            Cancel
          </button>
        </div>
      )}
      <button
        onClick={handleDownload}
        disabled={downloading}
        style={accentStyle}
        className="w-44 rounded-full bg-accent py-2.5 text-center text-sm font-medium text-accent-foreground transition-opacity hover:opacity-85 disabled:opacity-60"
      >
        {downloading ? `Downloading… ${Math.round(progress * 100)}%` : "Download"}
      </button>
    </div>
  );
}
