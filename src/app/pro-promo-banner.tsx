"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

// A rotating, occasional reminder of a concrete Pro perk for logged-in Free users -
// shown at most once every few days (not every page load, that's a dark pattern -
// see feedback_ux_no_dark_patterns), always dismissible, never blocking. Anonymous
// visitors and Pro accounts never see this; Free is the only tier it's relevant to.
const PERKS = [
  "Pro files are never auto-deleted for inactivity. Free files go after 30 days unused.",
  "Pro gets password-protected links and a custom link name instead of a random one.",
  "Pro sees today's Daily Character portrait art. Free gets a locked preview.",
  "Pro's daily download quota is 25GB, 5x Free's 5GB.",
  "Pro can set any custom link expiry, not just the 24h/7d presets.",
];

const STORAGE_KEY = "pro-promo-last-shown";
const MIN_DAYS_BETWEEN_SHOWS = 4;

function readLastShown(): number {
  try {
    return Number(localStorage.getItem(STORAGE_KEY)) || 0;
  } catch {
    return 0;
  }
}

function writeLastShown() {
  try {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {
    // ignore - localStorage unavailable (private mode, etc.), just won't throttle
  }
}

export function ProPromoBanner() {
  const { data: session, status } = useSession();
  const [visible, setVisible] = useState(false);
  const [perk] = useState(() => PERKS[Math.floor(Math.random() * PERKS.length)]);

  useEffect(() => {
    if (status !== "authenticated" || session?.user?.planTier !== "FREE") return;
    const daysSinceShown = (Date.now() - readLastShown()) / (1000 * 60 * 60 * 24);
    if (daysSinceShown < MIN_DAYS_BETWEEN_SHOWS) return;
    const t = setTimeout(() => {
      setVisible(true);
      writeLastShown();
    }, 1500);
    return () => clearTimeout(t);
  }, [status, session?.user?.planTier]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 w-[calc(100%-3rem)] max-w-sm -translate-x-1/2 rounded-2xl border border-border bg-surface p-4 text-sm shadow-lg relative">
      <button
        onClick={() => setVisible(false)}
        aria-label="Dismiss"
        className="absolute right-3 top-3 text-muted transition-colors hover:text-foreground"
      >
        ×
      </button>
      <p className="pr-5 text-foreground">{perk}</p>
      <div className="mt-3 flex items-center gap-3">
        <Link
          href="/pricing"
          className="rounded-full bg-accent px-3.5 py-1.5 text-xs font-medium text-accent-foreground transition-opacity hover:opacity-85"
        >
          See Pro plans
        </Link>
        <button
          onClick={() => setVisible(false)}
          className="text-xs text-muted transition-colors hover:text-foreground"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
