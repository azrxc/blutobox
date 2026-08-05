"use client";

import { useState } from "react";
import { ImageFormatConverter } from "./image-format-converter";
import { ImagesToPdfConverter } from "./images-to-pdf-converter";
import { PdfToImagesConverter } from "./pdf-to-images-converter";
import { PdfMergeConverter } from "./pdf-merge-converter";
import { PdfSplitConverter } from "./pdf-split-converter";
import { DocToPdfConverter } from "./doc-to-pdf-converter";

const MODES = [
  { id: "image", label: "Image format" },
  { id: "pdf-merge", label: "Merge PDFs" },
  { id: "pdf-split", label: "Split PDF" },
  { id: "doc-to-pdf", label: "DOCX → PDF" },
  { id: "images-to-pdf", label: "Images → PDF" },
  { id: "pdf-to-images", label: "PDF → Images" },
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
      {mode === "pdf-merge" && <PdfMergeConverter />}
      {mode === "pdf-split" && <PdfSplitConverter />}
      {mode === "doc-to-pdf" && <DocToPdfConverter />}
      {mode === "images-to-pdf" && <ImagesToPdfConverter />}
      {mode === "pdf-to-images" && <PdfToImagesConverter />}

      <p className="text-center text-xs text-muted">
        Everything happens locally in your browser. Your files are never sent anywhere.
      </p>
    </div>
  );
}
