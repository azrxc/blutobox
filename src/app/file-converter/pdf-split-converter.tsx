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

export function PdfSplitConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConvert() {
    if (!file) return;
    setConverting(true);
    setError(null);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const bytes = await file.arrayBuffer();
      const src = await PDFDocument.load(bytes);
      const pageCount = src.getPageCount();
      const baseName = file.name.replace(/\.pdf$/i, "");

      const results: File[] = [];
      for (let i = 0; i < pageCount; i++) {
        const single = await PDFDocument.create();
        const [page] = await single.copyPages(src, [i]);
        single.addPage(page);
        const singleBytes = await single.save();
        results.push(
          new File([new Uint8Array(singleBytes)], `${baseName} - page ${i + 1}.pdf`, { type: "application/pdf" })
        );
      }

      if (results.length === 1) {
        downloadBlob(results[0], results[0].name);
      } else {
        const zipped = await zipFiles(results);
        downloadBlob(zipped, `${baseName}-split.zip`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Split failed — make sure the file is a valid PDF");
    } finally {
      setConverting(false);
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

      <p className="text-xs text-muted">Splits every page into its own PDF, bundled as a .zip.</p>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <button
        onClick={handleConvert}
        disabled={!file || converting}
        className="w-full rounded-full bg-accent py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-85 disabled:opacity-40"
      >
        {converting ? "Splitting…" : "Split & download"}
      </button>
    </div>
  );
}
