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

export function DocToPdfConverter() {
  const { data: session } = useSession();
  const isPro = session?.user?.planTier === "PRO";

  const [file, setFile] = useState<File | null>(null);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Blob | null>(null);
  const [margin, setMargin] = useState(10);

  async function handleConvert() {
    if (!file) return;
    setConverting(true);
    setError(null);
    setResult(null);
    let container: HTMLDivElement | null = null;
    try {
      // Import the browser-specific bundle explicitly rather than the package's default
      // entry point - this project got burned once already by a bundler not respecting a
      // package's "browser" field remap (see the qrcode package history), so we avoid
      // relying on that resolution path here too.
      const mammothMod = await import("mammoth/mammoth.browser.js");
      const mammoth = mammothMod.default ?? mammothMod;

      const arrayBuffer = await file.arrayBuffer();
      const { value: html } = await mammoth.convertToHtml(
        { arrayBuffer },
        {
          convertImage: mammoth.images.imgElement((image) =>
            image.readAsBase64String().then((src) => ({ src: `data:${image.contentType};base64,${src}` }))
          ),
        }
      );

      container = document.createElement("div");
      container.style.padding = "24px";
      container.style.fontFamily = "Arial, sans-serif";
      container.style.fontSize = "12px";
      container.style.lineHeight = "1.5";
      container.innerHTML = html;
      document.body.appendChild(container);

      const html2pdf = (await import("html2pdf.js")).default;
      const blob: Blob = await html2pdf()
        .set({ margin: isPro ? margin : 10, jsPDF: { unit: "pt", format: "a4" } })
        .from(container)
        .outputPdf("blob");

      downloadBlob(blob, file.name.replace(/\.docx?$/i, ".pdf"));
      setResult(blob);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed");
    } finally {
      if (container) document.body.removeChild(container);
      setConverting(false);
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-surface p-5">
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background px-6 py-8 text-center transition-colors hover:border-foreground/30">
        <span className="text-sm font-medium">{file ? file.name : "Choose a .docx file"}</span>
        <span className="text-xs text-muted">{file ? "Click to change" : "or drag and drop"}</span>
        <input
          type="file"
          accept=".docx"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="hidden"
        />
      </label>

      <p className="rounded-lg bg-yellow-500/10 px-3 py-2 text-xs text-yellow-800 dark:text-yellow-300">
        Works best for simple documents (text, headings, basic images). Complex tables, columns, or heavy
        formatting may not convert perfectly, since this runs entirely in your browser instead of a full Word
        engine. Only modern .docx files are supported, not the older .doc format.
      </p>

      <div className="space-y-1.5">
        <label className="flex items-center justify-between text-xs text-muted" htmlFor="margin">
          <span className="flex items-center gap-1.5">
            Page margin
            <ProBadge />
          </span>
          <span>{margin}mm</span>
        </label>
        <input
          id="margin"
          type="range"
          min={0}
          max={40}
          step={2}
          value={margin}
          onChange={(e) => setMargin(Number(e.target.value))}
          disabled={!isPro}
          className="w-full disabled:opacity-50"
        />
      </div>
      {!isPro && (
        <p className="text-xs text-muted">
          <Link href="/pricing" className="underline underline-offset-2">
            Upgrade to Pro
          </Link>{" "}
          to set a custom page margin.
        </p>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}

      <button
        onClick={handleConvert}
        disabled={!file || converting}
        className="w-full rounded-full bg-accent py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-85 disabled:opacity-40"
      >
        {converting ? "Converting…" : "Convert & download"}
      </button>
      {result && <UploadToBlutoButton blob={result} filename={file ? file.name.replace(/\.docx?$/i, ".pdf") : "document.pdf"} />}
    </div>
  );
}
