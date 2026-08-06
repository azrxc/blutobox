"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { diffWords, diffLines, type Change } from "diff";
import { UploadToBlutoButton } from "../file-converter/upload-to-bluto-button";

type Mode = "words" | "lines";

function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildExportHtml(parts: Change[]): string {
  const body = parts
    .map((part) => {
      const text = escapeHtml(part.value);
      if (part.added) return `<span style="background:#dcfce7;color:#15803d">${text}</span>`;
      if (part.removed) return `<span style="background:#fee2e2;color:#dc2626;text-decoration:line-through">${text}</span>`;
      return text;
    })
    .join("");
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Text diff</title></head><body style="font-family:ui-monospace,monospace;white-space:pre-wrap;line-height:1.6;padding:24px;max-width:800px;margin:0 auto">${body}</body></html>`;
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

export function TextDiffTool() {
  const { data: session } = useSession();
  const isPro = session?.user?.planTier === "PRO";

  const [original, setOriginal] = useState("");
  const [changed, setChanged] = useState("");
  const [mode, setMode] = useState<Mode>("words");
  const [result, setResult] = useState<Change[] | null>(null);
  const [exported, setExported] = useState<Blob | null>(null);

  function handleCompare() {
    const parts = mode === "words" ? diffWords(original, changed) : diffLines(original, changed);
    setResult(parts);
    setExported(null);
  }

  function handleExport() {
    if (!result) return;
    const blob = new Blob([buildExportHtml(result)], { type: "text/html" });
    downloadBlob(blob, "text-diff.html");
    setExported(blob);
  }

  return (
    <div className="w-full max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Text diff / compare</h1>
        <p className="mt-1 text-sm text-muted">
          Paste two blocks of text to see exactly what changed. Nothing is ever sent anywhere.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs text-muted" htmlFor="original">
            Original
          </label>
          <textarea
            id="original"
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            rows={10}
            className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none transition-colors focus:border-foreground/30"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted" htmlFor="changed">
            Changed
          </label>
          <textarea
            id="changed"
            value={changed}
            onChange={(e) => setChanged(e.target.value)}
            rows={10}
            className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none transition-colors focus:border-foreground/30"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-full border border-border p-1 text-xs">
          <button
            onClick={() => setMode("words")}
            className={`rounded-full px-3.5 py-1.5 font-medium transition-colors ${
              mode === "words" ? "bg-accent text-accent-foreground" : "text-muted hover:text-foreground"
            }`}
          >
            Word by word
          </button>
          <button
            onClick={() => setMode("lines")}
            className={`rounded-full px-3.5 py-1.5 font-medium transition-colors ${
              mode === "lines" ? "bg-accent text-accent-foreground" : "text-muted hover:text-foreground"
            }`}
          >
            Line by line
          </button>
        </div>
        <button
          onClick={handleCompare}
          disabled={!original && !changed}
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-85 disabled:opacity-40"
        >
          Compare
        </button>
      </div>

      {result && (
        <div className="space-y-3">
          <div className="whitespace-pre-wrap rounded-xl border border-border bg-surface p-4 text-sm leading-relaxed">
            {result.length === 0 || result.every((p) => !p.added && !p.removed) ? (
              <p className="text-muted">No differences.</p>
            ) : (
              result.map((part, i) => (
                <span
                  key={i}
                  className={
                    part.added
                      ? "bg-green-500/15 text-green-700 dark:text-green-400"
                      : part.removed
                        ? "bg-red-500/15 text-red-600 line-through dark:text-red-400"
                        : ""
                  }
                >
                  {part.value}
                </span>
              ))
            )}
          </div>

          {isPro ? (
            <button
              onClick={handleExport}
              className="w-full rounded-full border border-border py-2.5 text-sm font-medium transition-colors hover:bg-background"
            >
              Export as HTML
            </button>
          ) : (
            <p className="text-center text-xs text-muted">
              <Link href="/pricing" className="underline underline-offset-2">
                Upgrade to Pro
              </Link>{" "}
              to export this comparison as an HTML file.
            </p>
          )}
          {exported && <UploadToBlutoButton blob={exported} filename="text-diff.html" />}
        </div>
      )}
    </div>
  );
}
