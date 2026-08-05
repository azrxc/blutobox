"use client";

import { useState } from "react";

export function BookmarkButton({ slug, initialBookmarked }: { slug: string; initialBookmarked: boolean }) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/bookmarks", {
      method: bookmarked ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    setLoading(false);
    if (res.ok) {
      setBookmarked(!bookmarked);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong");
      setTimeout(() => setError(null), 3000);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={toggle}
        disabled={loading}
        title={bookmarked ? "Remove from saved" : "Save to my account"}
        aria-label={bookmarked ? "Remove from saved" : "Save to my account"}
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors disabled:opacity-50 ${
          bookmarked
            ? "border-accent text-accent"
            : "border-border text-muted hover:bg-background hover:text-foreground"
        }`}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill={bookmarked ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      </button>
      {error && (
        <p className="absolute top-12 right-0 z-10 w-48 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-red-500 shadow-sm">
          {error}
        </p>
      )}
    </div>
  );
}
