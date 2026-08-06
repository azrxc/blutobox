"use client";

import { useState } from "react";
import { UploadToBlutoButton } from "./upload-to-bluto-button";

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

// Normalize every input through canvas -> PNG data URL, so jsPDF always gets a
// format it reliably supports regardless of the original file's format (WebP/HEIC/etc).
function imageToPngDataUrl(img: HTMLImageElement): string {
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported in this browser");
  ctx.drawImage(img, 0, 0);
  return canvas.toDataURL("image/png");
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

export function ImagesToPdfConverter() {
  const [files, setFiles] = useState<File[]>([]);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Blob | null>(null);

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleConvert() {
    if (files.length === 0) return;
    setConverting(true);
    setError(null);
    setResult(null);
    try {
      const { default: jsPDF } = await import("jspdf");
      let doc: InstanceType<typeof jsPDF> | null = null;

      for (const file of files) {
        const img = await loadImage(file);
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        const orientation = width > height ? "l" : "p";
        const dataUrl = imageToPngDataUrl(img);

        if (!doc) {
          doc = new jsPDF({ orientation, unit: "px", format: [width, height] });
        } else {
          doc.addPage([width, height], orientation);
        }
        doc.addImage(dataUrl, "PNG", 0, 0, width, height);
      }

      if (doc) {
        const blob = doc.output("blob");
        downloadBlob(blob, "images.pdf");
        setResult(blob);
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
        <span className="text-xs text-muted">{files.length > 0 ? "Click to add more" : "or drag and drop"}</span>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setFiles((prev) => [...prev, ...Array.from(e.target.files ?? [])])}
          className="hidden"
        />
      </label>

      {files.length > 0 && (
        <ul className="space-y-1.5 rounded-xl border border-border bg-background p-3">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`} className="flex items-center justify-between gap-2 text-xs">
              <span className="truncate">
                {i + 1}. {f.name}
              </span>
              <button
                onClick={() => removeFile(i)}
                className="shrink-0 text-muted transition-colors hover:text-foreground"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}

      <button
        onClick={handleConvert}
        disabled={files.length === 0 || converting}
        className="w-full rounded-full bg-accent py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-85 disabled:opacity-40"
      >
        {converting ? "Building PDF…" : "Convert & download"}
      </button>
      {result && <UploadToBlutoButton blob={result} filename="images.pdf" />}
    </div>
  );
}
