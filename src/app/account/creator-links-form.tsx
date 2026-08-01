"use client";

import { useState } from "react";

export function CreatorLinksForm({
  discordUrl,
  youtubeUrl,
  supportUrl,
}: {
  discordUrl: string | null;
  youtubeUrl: string | null;
  supportUrl: string | null;
}) {
  const [discord, setDiscord] = useState(discordUrl ?? "");
  const [youtube, setYoutube] = useState(youtubeUrl ?? "");
  const [support, setSupport] = useState(supportUrl ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError(null);
    const res = await fetch("/api/account/update-links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ discordUrl: discord, youtubeUrl: youtube, supportUrl: support }),
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
        <p className="mt-1 text-xs text-muted">Shown on your file pages so downloaders can find and follow you.</p>
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
        <label className="text-xs text-muted" htmlFor="youtubeUrl">
          YouTube channel (optional)
        </label>
        <input
          id="youtubeUrl"
          type="url"
          placeholder="https://youtube.com/@..."
          value={youtube}
          onChange={(e) => setYoutube(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none transition-colors focus:border-foreground/30"
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs text-muted" htmlFor="supportUrl">
          Support link (optional)
        </label>
        <input
          id="supportUrl"
          type="url"
          placeholder="Ko-fi, Buy Me a Coffee, Patreon, etc."
          value={support}
          onChange={(e) => setSupport(e.target.value)}
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
