"use client";

import { useState } from "react";

export function CreatorLinksForm({
  discordUrl,
  donationUrl,
}: {
  discordUrl: string | null;
  donationUrl: string | null;
}) {
  const [discord, setDiscord] = useState(discordUrl ?? "");
  const [donation, setDonation] = useState(donationUrl ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError(null);
    const res = await fetch("/api/account/update-links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ discordUrl: discord, donationUrl: donation }),
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
        <h2 className="text-sm font-semibold">Creator links</h2>
        <p className="mt-1 text-xs text-muted">
          Shown on your file pages so downloaders can find your Discord or support you directly.
        </p>
      </div>
      {status === "done" && (
        <p className="rounded-lg bg-green-500/10 px-3 py-2 text-sm text-green-700 dark:text-green-400">
          Links updated.
        </p>
      )}
      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <div className="space-y-1.5">
        <label className="text-xs text-muted" htmlFor="discordUrl">
          Discord invite link (optional)
        </label>
        <input
          id="discordUrl"
          type="url"
          placeholder="https://discord.gg/..."
          value={discord}
          onChange={(e) => setDiscord(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none transition-colors focus:border-foreground/30"
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs text-muted" htmlFor="donationUrl">
          Donation/support link (optional)
        </label>
        <input
          id="donationUrl"
          type="url"
          placeholder="https://ko-fi.com/... or Buy Me a Coffee, Patreon, etc."
          value={donation}
          onChange={(e) => setDonation(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none transition-colors focus:border-foreground/30"
        />
      </div>
      <button
        type="submit"
        disabled={status === "saving"}
        className="rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-surface disabled:opacity-50"
      >
        {status === "saving" ? "Saving…" : "Save links"}
      </button>
    </form>
  );
}
