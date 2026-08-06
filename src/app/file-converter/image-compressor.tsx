"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { zipFiles } from "@/lib/zip-files";
import { UploadToBlutoButton } from "./upload-to-bluto-button";
import { ProBadge } from "../pro-badge";

const FREE_MAX_BATCH = 5;
const PRO_MAX_BATCH = 30;

function formatBytes(bytes: number) {
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value.toFixed(1)} ${units[unit]}`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

type Result = { name: string; originalBytes: number; compressedBytes: number; blob: Blob };

export function ImageCompressor() {
  const { data: session } = useSession();
  const isPro = session?.user?.planTier === "PRO";
  const maxBatch = isPro ? PRO_MAX_BATCH : FREE_MAX_BATCH;

  const [files, setFiles] = useState<File[]>([]);
  const [maxSizeMB, setMaxSizeMB] = useState(1);
  const [exactDimension, setExactDimension] = useState("");
  const [compressing, setCompressing] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [downloadResult, setDownloadResult] = useState<{ blob: Blob; filename: string } | null>(null);

  async function handleCompress() {
    if (files.length === 0) return;
    setCompressing(true);
    setError(null);
    setResults([]);
    setDownloadResult(null);
    try {
      const imageCompression = (await import("browser-image-compression")).default;
      const compressed: Result[] = [];
      const maxWidthOrHeight = isPro && exactDimension ? Number(exactDimension) : undefined;
      for (const file of files) {
        const output = await imageCompression(file, { maxSizeMB, maxWidthOrHeight, useWebWorker: true });
        compressed.push({
          name: file.name,
          originalBytes: file.size,
          compressedBytes: output.size,
          blob: output,
        });
      }
      setResults(compressed);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Compression failed");
    } finally {
      setCompressing(false);
    }
  }

  async function handleDownload() {
    if (results.length === 1) {
      downloadBlob(results[0].blob, results[0].name);
      setDownloadResult({ blob: results[0].blob, filename: results[0].name });
      return;
    }
    const zipped = await zipFiles(results.map((r) => new File([r.blob], r.name, { type: r.blob.type })));
    downloadBlob(zipped, "compressed-images.zip");
    setDownloadResult({ blob: zipped, filename: "compressed-images.zip" });
  }

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-surface p-5">
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background px-6 py-8 text-center transition-colors hover:border-foreground/30">
        <span className="text-sm font-medium">
          {files.length > 0 ? `${files.length} image${files.length > 1 ? "s" : ""} selected` : "Choose images"}
        </span>
        <span className="text-xs text-muted">{files.length > 0 ? "Click to change" : "or drag and drop"}</span>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            const chosen = Array.from(e.target.files ?? []);
            setFiles(chosen.slice(0, maxBatch));
            setResults([]);
            setDownloadResult(null);
          }}
          className="hidden"
        />
      </label>
      {files.length >= maxBatch && !isPro && (
        <p className="text-xs text-muted">
          Free is limited to {FREE_MAX_BATCH} images at once.{" "}
          <Link href="/pricing" className="underline underline-offset-2">
            Upgrade to Pro
          </Link>{" "}
          for up to {PRO_MAX_BATCH}.
        </p>
      )}

      <div className="space-y-1.5">
        <label className="flex justify-between text-xs text-muted" htmlFor="maxSize">
          <span>Target max size</span>
          <span>{maxSizeMB} MB</span>
        </label>
        <input
          id="maxSize"
          type="range"
          min={0.1}
          max={5}
          step={0.1}
          value={maxSizeMB}
          onChange={(e) => setMaxSizeMB(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <div className="space-y-1">
        <label className="flex items-center gap-1.5 text-xs text-muted" htmlFor="exactDimension">
          Max width/height in pixels (optional)
          <ProBadge />
        </label>
        <input
          id="exactDimension"
          type="number"
          min={1}
          placeholder="No resize"
          value={exactDimension}
          onChange={(e) => setExactDimension(e.target.value)}
          disabled={!isPro}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm disabled:opacity-50"
        />
      </div>
      {!isPro && (
        <p className="text-xs text-muted">
          <Link href="/pricing" className="underline underline-offset-2">
            Upgrade to Pro
          </Link>{" "}
          for exact pixel-dimension resizing and batches of up to {PRO_MAX_BATCH} images.
        </p>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}

      <button
        onClick={handleCompress}
        disabled={files.length === 0 || compressing}
        className="w-full rounded-full bg-accent py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-85 disabled:opacity-40"
      >
        {compressing ? "Compressing…" : "Compress"}
      </button>

      {results.length > 0 && (
        <div className="space-y-3 border-t border-border pt-4">
          <ul className="space-y-1 text-xs">
            {results.map((r) => (
              <li key={r.name} className="flex items-center justify-between gap-2 text-muted">
                <span className="truncate">{r.name}</span>
                <span className="shrink-0">
                  {formatBytes(r.originalBytes)} → {formatBytes(r.compressedBytes)}
                </span>
              </li>
            ))}
          </ul>
          <button
            onClick={handleDownload}
            className="w-full rounded-full border border-border py-2.5 text-sm font-medium transition-colors hover:bg-background"
          >
            Download {results.length > 1 ? "all (.zip)" : ""}
          </button>
          {downloadResult && <UploadToBlutoButton blob={downloadResult.blob} filename={downloadResult.filename} />}
        </div>
      )}
    </div>
  );
}
