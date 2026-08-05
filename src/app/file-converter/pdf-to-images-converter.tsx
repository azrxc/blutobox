"use client";

import { useState } from "react";
import { zipFiles } from "@/lib/zip-files";

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

export function PdfToImagesConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);

  async function handleConvert() {
    if (!file) return;
    setConverting(true);
    setError(null);
    setProgress("Loading PDF engine…");
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url
      ).toString();

      const buffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

      const results: File[] = [];
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        setProgress(`Rendering page ${pageNum} of ${pdf.numPages}…`);
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas not supported in this browser");
        await page.render({ canvasContext: ctx, canvas, viewport }).promise;
        const blob: Blob = await new Promise((resolve, reject) => {
          canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Failed to export page"))), "image/png");
        });
        results.push(new File([blob], `page-${pageNum}.png`, { type: "image/png" }));
      }

      if (results.length === 1) {
        downloadBlob(results[0], results[0].name);
      } else {
        const zipped = await zipFiles(results);
        downloadBlob(zipped, "pdf-pages.zip");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed");
    } finally {
      setConverting(false);
      setProgress(null);
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-surface p-5">
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background px-6 py-8 text-center transition-colors hover:border-foreground/30">
        <span className="text-sm font-medium">{file ? file.name : "Choose a PDF"}</span>
        <span className="text-xs text-muted">{file ? "Click to change" : "or drag and drop"}</span>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="hidden"
        />
      </label>

      {error && <p className="text-xs text-red-500">{error}</p>}
      {progress && <p className="text-xs text-muted">{progress}</p>}

      <button
        onClick={handleConvert}
        disabled={!file || converting}
        className="w-full rounded-full bg-accent py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-85 disabled:opacity-40"
      >
        {converting ? "Converting…" : "Convert & download"}
      </button>
    </div>
  );
}
