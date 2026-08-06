"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { UploadToBlutoButton } from "./upload-to-bluto-button";
import { ProBadge } from "../pro-badge";

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

export function PdfMergeConverter() {
  const { data: session } = useSession();
  const isPro = session?.user?.planTier === "PRO";

  const [files, setFiles] = useState<File[]>([]);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Blob | null>(null);
  const [addPageNumbers, setAddPageNumbers] = useState(false);

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleConvert() {
    if (files.length < 2) return;
    setConverting(true);
    setError(null);
    setResult(null);
    try {
      const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
      const merged = await PDFDocument.create();

      for (const file of files) {
        const bytes = await file.arrayBuffer();
        const src = await PDFDocument.load(bytes);
        const pages = await merged.copyPages(src, src.getPageIndices());
        pages.forEach((page) => merged.addPage(page));
      }

      if (isPro && addPageNumbers) {
        const font = await merged.embedFont(StandardFonts.Helvetica);
        const pages = merged.getPages();
        pages.forEach((page, i) => {
          const label = `Page ${i + 1} of ${pages.length}`;
          const { width } = page.getSize();
          const textWidth = font.widthOfTextAtSize(label, 9);
          page.drawText(label, {
            x: width / 2 - textWidth / 2,
            y: 16,
            size: 9,
            font,
            color: rgb(0.5, 0.5, 0.5),
          });
        });
      }

      const mergedBytes = await merged.save();
      const blob = new Blob([new Uint8Array(mergedBytes)], { type: "application/pdf" });
      downloadBlob(blob, "merged.pdf");
      setResult(blob);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Merge failed. Make sure all files are valid PDFs");
    } finally {
      setConverting(false);
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-surface p-5">
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background px-6 py-8 text-center transition-colors hover:border-foreground/30">
        <span className="text-sm font-medium">
          {files.length > 0 ? `${files.length} PDF${files.length > 1 ? "s" : ""} selected` : "Choose PDFs"}
        </span>
        <span className="text-xs text-muted">{files.length > 0 ? "Click to add more" : "select 2 or more, in order"}</span>
        <input
          type="file"
          accept="application/pdf"
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

      <label className="flex items-center gap-2 text-xs text-muted">
        <input
          type="checkbox"
          checked={addPageNumbers}
          onChange={(e) => setAddPageNumbers(e.target.checked)}
          disabled={!isPro}
          className="h-3.5 w-3.5 rounded border-border disabled:opacity-50"
        />
        Add page numbers to the footer
        <ProBadge />
      </label>
      {!isPro && (
        <p className="text-xs text-muted">
          <Link href="/pricing" className="underline underline-offset-2">
            Upgrade to Pro
          </Link>{" "}
          to add page numbers to the merged PDF.
        </p>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}

      <button
        onClick={handleConvert}
        disabled={files.length < 2 || converting}
        className="w-full rounded-full bg-accent py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-85 disabled:opacity-40"
      >
        {converting ? "Merging…" : "Merge & download"}
      </button>
      {result && <UploadToBlutoButton blob={result} filename="merged.pdf" />}
    </div>
  );
}
