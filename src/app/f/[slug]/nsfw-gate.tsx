"use client";

import { useState, type ReactNode } from "react";

export function NsfwGate({ isNsfw, children }: { isNsfw: boolean; children: ReactNode }) {
  const [confirmed, setConfirmed] = useState(!isNsfw);

  if (!confirmed) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-8 text-center">
        <p className="text-sm font-medium">This file is flagged as NSFW / adult content.</p>
        <p className="text-xs text-muted">You must be 18 or older to view or download it.</p>
        <button
          onClick={() => setConfirmed(true)}
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-85"
        >
          I am 18+, show content
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
