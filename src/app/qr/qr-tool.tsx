"use client";

import { useState } from "react";
import QRCode from "qrcode";

export function QrTool() {
  const [text, setText] = useState("");
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!text.trim()) return;
    try {
      const generated = await QRCode.toString(text.trim(), { type: "svg", margin: 1, width: 280 });
      setSvg(generated);
    } catch {
      setError("Failed to generate QR code.");
      setSvg(null);
    }
  }

  function handleDownload() {
    if (!svg) return;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "qr-code.svg";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div>
        <h1 className="text-xl font-semibold">QR code generator</h1>
        <p className="mt-1 text-sm text-muted">Turn any link or text into a scannable QR code. Free, no sign-up.</p>
      </div>

      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <form onSubmit={handleGenerate} className="flex gap-2">
        <input
          type="text"
          required
          placeholder="https://example.com or any text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none transition-colors focus:border-foreground/30"
        />
        <button
          type="submit"
          className="shrink-0 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-85"
        >
          Generate
        </button>
      </form>

      {svg && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-6">
          <div className="rounded-xl bg-white p-4" dangerouslySetInnerHTML={{ __html: svg }} />
          <button
            onClick={handleDownload}
            className="rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-background"
          >
            Download SVG
          </button>
        </div>
      )}

      <p className="text-center text-xs text-muted">
        Generated entirely in your browser — nothing you enter here is ever sent to a server.
      </p>
    </div>
  );
}
