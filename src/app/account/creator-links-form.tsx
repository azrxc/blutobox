"use client";

import { useState } from "react";

type Link = { label: string; url: string };

const MAX_LINKS = 5;

export function CreatorLinksForm({ initialLinks }: { initialLinks: Link[] }) {
  const [links, setLinks] = useState<Link[]>(initialLinks.length > 0 ? initialLinks : [{ label: "", url: "" }]);
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  function updateLink(i: number, field: keyof Link, value: string) {
    setLinks((prev) => prev.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)));
  }

  function addLink() {
    if (links.length >= MAX_LINKS) return;
    setLinks((prev) => [...prev, { label: "", url: "" }]);
  }

  function removeLink(i: number) {
    setLinks((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError(null);
    const cleaned = links.map((l) => ({ label: l.label.trim(), url: l.url.trim() })).filter((l) => l.label && l.url);
    const res = await fetch("/api/account/update-links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ links: cleaned }),
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
          Add up to {MAX_LINKS} links — your Discord, socials, a Ko-fi/Patreon, your store, whatever. Shown on your
          file pages so downloaders can find you.
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
      <div className="space-y-3">
        {links.map((link, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="grid flex-1 grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Name (e.g. Discord)"
                maxLength={50}
                value={link.label}
                onChange={(e) => updateLink(i, "label", e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none transition-colors focus:border-foreground/30"
              />
              <input
                type="url"
                placeholder="https://..."
                value={link.url}
                onChange={(e) => updateLink(i, "url", e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none transition-colors focus:border-foreground/30"
              />
            </div>
            <button
              type="button"
              onClick={() => removeLink(i)}
              className="shrink-0 px-1 py-2.5 text-xs text-muted transition-colors hover:text-foreground"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      {links.length < MAX_LINKS && (
        <button
          type="button"
          onClick={addLink}
          className="text-xs text-muted underline underline-offset-2 hover:text-foreground"
        >
          + Add another link
        </button>
      )}
      <div>
        <button
          type="submit"
          disabled={status === "saving"}
          className="rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-surface disabled:opacity-50"
        >
          {status === "saving" ? "Saving…" : "Save links"}
        </button>
      </div>
    </form>
  );
}
