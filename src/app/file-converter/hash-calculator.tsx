"use client";

import { useState } from "react";

type Algorithm = "SHA-256" | "SHA-1" | "SHA-512";

const LARGE_FILE_WARNING_BYTES = 500 * 1024 * 1024; // 500MB

function bufferToHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function HashCalculator() {
  const [file, setFile] = useState<File | null>(null);
  const [algorithm, setAlgorithm] = useState<Algorithm>("SHA-256");
  const [hash, setHash] = useState<string | null>(null);
  const [compareTo, setCompareTo] = useState("");
  const [computing, setComputing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleCompute() {
    if (!file) return;
    setComputing(true);
    setError(null);
    setHash(null);
    setCopied(false);
    try {
      const buffer = await file.arrayBuffer();
      const digest = await crypto.subtle.digest(algorithm, buffer);
      setHash(bufferToHex(digest));
    } catch {
      setError("Couldn't compute the hash for this file");
    } finally {
      setComputing(false);
    }
  }

  function handleCopy() {
    if (!hash) return;
    navigator.clipboard.writeText(hash).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  const normalizedCompare = compareTo.trim().toLowerCase();
  const matchState = !normalizedCompare || !hash ? null : normalizedCompare === hash ? "match" : "mismatch";

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-surface p-5">
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background px-6 py-8 text-center transition-colors hover:border-foreground/30">
        <span className="text-sm font-medium">{file ? file.name : "Choose a file"}</span>
        <span className="text-xs text-muted">{file ? "Click to change" : "or drag and drop"}</span>
        <input
          type="file"
          onChange={(e) => {
            setFile(e.target.files?.[0] ?? null);
            setHash(null);
            setError(null);
          }}
          className="hidden"
        />
      </label>

      {file && file.size > LARGE_FILE_WARNING_BYTES && (
        <p className="text-xs text-muted">
          This is a large file, hashing it happens entirely in your browser and may take a while and use a fair
          bit of memory, especially on mobile.
        </p>
      )}

      <div className="space-y-1.5">
        <label className="text-xs text-muted" htmlFor="algorithm">
          Algorithm
        </label>
        <select
          id="algorithm"
          value={algorithm}
          onChange={(e) => {
            setAlgorithm(e.target.value as Algorithm);
            setHash(null);
          }}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="SHA-256">SHA-256</option>
          <option value="SHA-1">SHA-1</option>
          <option value="SHA-512">SHA-512</option>
        </select>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <button
        onClick={handleCompute}
        disabled={!file || computing}
        className="w-full rounded-full bg-accent py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-85 disabled:opacity-40"
      >
        {computing ? "Computing…" : "Compute hash"}
      </button>

      {hash && (
        <div className="space-y-3 border-t border-border pt-4">
          <div className="space-y-1.5">
            <label className="text-xs text-muted">{algorithm} hash</label>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={hash}
                onFocus={(e) => e.target.select()}
                className="w-full truncate rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs"
              />
              <button
                onClick={handleCopy}
                className="shrink-0 rounded-lg border border-border px-3 py-2 text-xs font-medium transition-colors hover:bg-background"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-muted" htmlFor="compare">
              Compare against (optional)
            </label>
            <input
              id="compare"
              type="text"
              placeholder="Paste the expected hash to verify a match"
              value={compareTo}
              onChange={(e) => setCompareTo(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs outline-none focus:border-foreground/30"
            />
            {matchState === "match" && (
              <p className="text-xs text-green-600 dark:text-green-400">Matches. The file is intact.</p>
            )}
            {matchState === "mismatch" && (
              <p className="text-xs text-red-500">Doesn&apos;t match, the file may be corrupted or altered.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
