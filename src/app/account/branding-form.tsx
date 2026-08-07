"use client";

import { useState } from "react";
import Link from "next/link";
import { ProBadge } from "../pro-badge";

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export function BrandingForm({
  isPro,
  initialMessage,
  initialColor,
}: {
  isPro: boolean;
  initialMessage: string | null;
  initialColor: string | null;
}) {
  const [message, setMessage] = useState(initialMessage ?? "");
  const [color, setColor] = useState(initialColor ?? "#3b82f6");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (color && !HEX_COLOR.test(color)) {
      setError("Color must be a valid hex code");
      setStatus("error");
      return;
    }
    setStatus("saving");
    setError(null);
    const res = await fetch("/api/account/branding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: message.trim() || null, color: color || null }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong");
      setStatus("error");
      return;
    }
    setStatus("done");
  }

  return (
    <form onSubmit={submit} className="max-w-sm space-y-4">
      <div>
        <h2 className="flex items-center gap-1.5 text-sm font-semibold">
          Custom branding
          {!isPro && <ProBadge />}
        </h2>
        <p className="mt-1 text-xs text-muted">
          A message and accent color shown on every file page you share, instead of the default look.
          {!isPro && (
            <>
              {" "}
              <Link href="/pricing" className="underline underline-offset-2">
                Upgrade to Pro
              </Link>{" "}
              to unlock this.
            </>
          )}
        </p>
      </div>
      {status === "done" && (
        <p className="rounded-lg bg-green-500/10 px-3 py-2 text-sm text-green-700 dark:text-green-400">
          Branding updated.
        </p>
      )}
      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <div className="space-y-1">
        <label className="text-xs text-muted" htmlFor="brandMessage">
          Message
        </label>
        <input
          id="brandMessage"
          type="text"
          placeholder="e.g. Official releases by Acme Mods"
          maxLength={140}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={!isPro}
          className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none transition-colors focus:border-foreground/30 disabled:opacity-50"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs text-muted" htmlFor="brandColor">
          Accent color
        </label>
        <div className="flex items-center gap-2">
          <input
            id="brandColor"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            disabled={!isPro}
            className="h-10 w-14 rounded-lg border border-border bg-background disabled:opacity-50"
          />
          <input
            type="text"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            disabled={!isPro}
            maxLength={7}
            className="w-28 rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none transition-colors focus:border-foreground/30 disabled:opacity-50"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={!isPro || status === "saving"}
        className="rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-surface disabled:opacity-50"
      >
        {status === "saving" ? "Saving…" : "Save branding"}
      </button>
    </form>
  );
}
