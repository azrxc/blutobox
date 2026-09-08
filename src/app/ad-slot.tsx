"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

// Self-hides entirely if AdSense isn't configured yet (no publisher ID) or this
// specific placement has no ad unit ID assigned - safe to place anywhere in the
// app ahead of actually having an approved AdSense account or real ad units.
export function AdSlot({ slot }: { slot?: string }) {
  const insRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!ADSENSE_CLIENT_ID || !slot || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // AdSense script not loaded yet or blocked (ad blocker) - fail silently,
      // this is a non-critical UI element.
    }
  }, [slot]);

  if (!ADSENSE_CLIENT_ID || !slot) return null;

  return (
    <ins
      ref={insRef}
      className="adsbygoogle block"
      style={{ display: "block" }}
      data-ad-client={ADSENSE_CLIENT_ID}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
