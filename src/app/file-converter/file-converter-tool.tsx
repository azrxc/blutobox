"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

// Loaded on demand instead of statically - only one of these is ever shown at a time
// (picked via the mode toggle below), but a static import would still pull every tool's
// library (mammoth, pdf-lib, pdfjs-dist, gifenc, html2pdf.js, ...) into this page's
// server-rendered bundle, since "use client" components are still SSR'd for the initial
// render. ssr: false keeps them out of the server bundle entirely.
const ImageFormatConverter = dynamic(() => import("./image-format-converter").then((m) => m.ImageFormatConverter), { ssr: false });
const ImagesToPdfConverter = dynamic(() => import("./images-to-pdf-converter").then((m) => m.ImagesToPdfConverter), { ssr: false });
const PdfToImagesConverter = dynamic(() => import("./pdf-to-images-converter").then((m) => m.PdfToImagesConverter), { ssr: false });
const PdfMergeConverter = dynamic(() => import("./pdf-merge-converter").then((m) => m.PdfMergeConverter), { ssr: false });
const PdfSplitConverter = dynamic(() => import("./pdf-split-converter").then((m) => m.PdfSplitConverter), { ssr: false });
const DocToPdfConverter = dynamic(() => import("./doc-to-pdf-converter").then((m) => m.DocToPdfConverter), { ssr: false });
const HashCalculator = dynamic(() => import("./hash-calculator").then((m) => m.HashCalculator), { ssr: false });
const ImageCompressor = dynamic(() => import("./image-compressor").then((m) => m.ImageCompressor), { ssr: false });
const DuplicateFinder = dynamic(() => import("./duplicate-finder").then((m) => m.DuplicateFinder), { ssr: false });
const VideoToGifConverter = dynamic(() => import("./video-to-gif-converter").then((m) => m.VideoToGifConverter), { ssr: false });

const MODES = [
  { id: "image", label: "Image format" },
  { id: "compress", label: "Compress image" },
  { id: "pdf-merge", label: "Merge PDFs" },
  { id: "pdf-split", label: "Split PDF" },
  { id: "doc-to-pdf", label: "DOCX → PDF" },
  { id: "images-to-pdf", label: "Images → PDF" },
  { id: "pdf-to-images", label: "PDF → Images" },
  { id: "video-to-gif", label: "Video → GIF" },
  { id: "hash", label: "File hash" },
  { id: "duplicates", label: "Find duplicates" },
] as const;

type Mode = (typeof MODES)[number]["id"];

export function FileConverterTool() {
  const [mode, setMode] = useState<Mode>("image");

  return (
    <div className="w-full max-w-md space-y-6">
      <div>
        <h1 className="text-xl font-semibold">File converter</h1>
        <p className="mt-1 text-sm text-muted">
          Convert files right in your browser. Nothing is ever uploaded to a server.
        </p>
      </div>

      <div className="inline-flex flex-wrap gap-1 rounded-2xl border border-border p-1 text-xs">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`rounded-full px-3.5 py-1.5 font-medium transition-colors ${
              mode === m.id ? "bg-accent text-accent-foreground" : "text-muted hover:text-foreground"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {mode === "image" && <ImageFormatConverter />}
      {mode === "compress" && <ImageCompressor />}
      {mode === "pdf-merge" && <PdfMergeConverter />}
      {mode === "pdf-split" && <PdfSplitConverter />}
      {mode === "doc-to-pdf" && <DocToPdfConverter />}
      {mode === "images-to-pdf" && <ImagesToPdfConverter />}
      {mode === "pdf-to-images" && <PdfToImagesConverter />}
      {mode === "video-to-gif" && <VideoToGifConverter />}
      {mode === "hash" && <HashCalculator />}
      {mode === "duplicates" && <DuplicateFinder />}

      <p className="text-center text-xs text-muted">
        Everything happens locally in your browser. Your files are never sent anywhere.
      </p>
    </div>
  );
}
