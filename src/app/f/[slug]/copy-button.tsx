"use client";

import { useState } from "react";

export function CopyButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // ignore - clipboard API unavailable
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      onClick={handleCopy}
      className="rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-background"
    >
      {copied ? "Copied!" : "Copy link"}
    </button>
  );
}
