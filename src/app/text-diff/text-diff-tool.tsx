"use client";

import { useState } from "react";
import { diffWords, diffLines, type Change } from "diff";

type Mode = "words" | "lines";

export function TextDiffTool() {
  const [original, setOriginal] = useState("");
  const [changed, setChanged] = useState("");
  const [mode, setMode] = useState<Mode>("words");
  const [result, setResult] = useState<Change[] | null>(null);

  function handleCompare() {
    const parts = mode === "words" ? diffWords(original, changed) : diffLines(original, changed);
    setResult(parts);
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
      )}
    </div>
  );
}
