"use client";

import { useState } from "react";

export function CopyLinkField({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) - fall back to manual select.
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-surface p-1.5 pl-4">
      <input
        readOnly
        value={url}
        onFocus={(e) => e.currentTarget.select()}
        className="min-w-0 flex-1 truncate bg-transparent text-sm outline-none"
      />
      <button
        onClick={handleCopy}
        className="shrink-0 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground transition-opacity hover:opacity-85"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}
