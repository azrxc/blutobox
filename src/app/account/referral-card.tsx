"use client";

import { useState } from "react";

export function ReferralCard({
  url,
  bonusGb,
  maxBonusGb,
}: {
  url: string;
  bonusGb: number;
  maxBonusGb: number;
}) {
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
    <div>
      <h2 className="mb-3 text-sm font-semibold">Invite friends, get free perks</h2>
      <div className="space-y-3 rounded-2xl border border-border bg-surface p-5 text-sm">
        <p className="text-muted">
          Share your link. When someone signs up and verifies their email, you both get +1GB of storage and +1
          creator link slot, permanently, no subscription needed.
        </p>
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={url}
            onClick={(e) => e.currentTarget.select()}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs"
          />
          <button
            onClick={handleCopy}
            className="shrink-0 rounded-full border border-border px-3.5 py-2 text-xs font-medium transition-colors hover:bg-background"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <p className="text-xs text-muted">
          {bonusGb > 0
            ? `You've earned +${bonusGb}GB from referrals${bonusGb >= maxBonusGb ? " (max reached)" : ""}.`
            : `Bonus storage caps at +${maxBonusGb}GB.`}
        </p>
      </div>
    </div>
  );
}
