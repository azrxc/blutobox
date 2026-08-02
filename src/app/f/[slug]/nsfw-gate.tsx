"use client";

import { useState, type ReactNode } from "react";

export function NsfwGate({ isNsfw, children }: { isNsfw: boolean; children: ReactNode }) {
  const [confirmed, setConfirmed] = useState(!isNsfw);

  if (!confirmed) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-8 text-center">
        <p className="text-sm font-medium">This content is age-restricted.</p>
        <p className="text-xs text-muted">It may not be suitable for all audiences. You must be 18 or older to continue.</p>
        <button
          onClick={() => setConfirmed(true)}
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-85"
        >
          I&apos;m 18 or older
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
