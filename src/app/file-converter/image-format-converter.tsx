"use client";

import { useState } from "react";
import { zipFiles } from "@/lib/zip-files";

export type Format = "png" | "jpeg" | "webp";

const FORMAT_EXT: Record<Format, string> = { png: "png", jpeg: "jpg", webp: "webp" };

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to load ${file.name}`));
    };
    img.src = url;
  });
}

async function convertImage(file: File, format: Format, quality: number): Promise<Blob> {
  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported in this browser");
  if (format === "jpeg") {
    // JPG has no transparency channel - flatten onto a white background first
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img, 0, 0);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error(`Failed to encode ${file.name}`))),
      `image/${format}`,
      quality
    );
  });
}

function renameExt(filename: string, ext: string) {
  const dot = filename.lastIndexOf(".");
  const base = dot > 0 ? filename.slice(0, dot) : filename;
  return `${base}.${ext}`;
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

export function ImageFormatConverter({ initialFormat = "png" }: { initialFormat?: Format }) {
  const [files, setFiles] = useState<File[]>([]);
  const [format, setFormat] = useState<Format>(initialFormat);
  const [quality, setQuality] = useState(0.9);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConvert() {
    if (files.length === 0) return;
    setConverting(true);
    setError(null);
    try {
      const results: File[] = [];
      for (const file of files) {
        const blob = await convertImage(file, format, quality);
        results.push(new File([blob], renameExt(file.name, FORMAT_EXT[format]), { type: blob.type }));
      }
      if (results.length === 1) {
        downloadBlob(results[0], results[0].name);
      } else {
        const zipped = await zipFiles(results);
        downloadBlob(zipped, "converted-images.zip");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed");
    } finally {
      setConverting(false);
    }
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
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          className="hidden"
        />
      </label>

      <div className="space-y-1.5">
        <label className="text-xs text-muted" htmlFor="format">
          Convert to
        </label>
        <select
          id="format"
          value={format}
          onChange={(e) => setFormat(e.target.value as Format)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="png">PNG</option>
          <option value="jpeg">JPG</option>
          <option value="webp">WebP</option>
        </select>
      </div>

      {format !== "png" && (
        <div className="space-y-1.5">
          <label className="flex justify-between text-xs text-muted" htmlFor="quality">
            <span>Quality</span>
            <span>{Math.round(quality * 100)}%</span>
          </label>
          <input
            id="quality"
            type="range"
            min={0.1}
            max={1}
            step={0.05}
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            className="w-full"
          />
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}

      <button
        onClick={handleConvert}
        disabled={files.length === 0 || converting}
        className="w-full rounded-full bg-accent py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-85 disabled:opacity-40"
      >
        {converting ? "Converting…" : "Convert & download"}
      </button>
    </div>
  );
}
