"use client";

import { useState } from "react";
import Link from "next/link";

export type AccountBookmark = { slug: string; filename: string; sizeBytes: string };

function formatBytes(bytesStr: string) {
  const n = Number(bytesStr);
  const units = ["B", "KB", "MB", "GB"];
  let value = n;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value.toFixed(1)} ${units[unit]}`;
}

function BookmarkRow({ bookmark, onRemoved }: { bookmark: AccountBookmark; onRemoved: (slug: string) => void }) {
  const [removing, setRemoving] = useState(false);

  async function handleRemove() {
    setRemoving(true);
    const res = await fetch("/api/bookmarks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: bookmark.slug }),
    });
    if (res.ok) {
      onRemoved(bookmark.slug);
    } else {
      setRemoving(false);
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 border-b border-border py-4 text-sm last:border-0">
      <div className="min-w-0 flex-1">
        <Link href={`/f/${bookmark.slug}`} className="break-all font-medium underline underline-offset-2">
          {bookmark.filename}
        </Link>
        <p className="mt-0.5 text-xs text-muted">{formatBytes(bookmark.sizeBytes)}</p>
      </div>
      <button
        onClick={handleRemove}
        disabled={removing}
        className="shrink-0 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-background hover:text-foreground disabled:opacity-50"
      >
        {removing ? "…" : "Remove"}
      </button>
    </div>
  );
}

export function BookmarkList({ bookmarks }: { bookmarks: AccountBookmark[] }) {
  const [items, setItems] = useState(bookmarks);

  if (items.length === 0) {
    return <p className="py-5 text-sm text-muted">You haven&apos;t saved any files yet.</p>;
  }

  return (
    <div>
      {items.map((b) => (
        <BookmarkRow
          key={b.slug}
          bookmark={b}
          onRemoved={(slug) => setItems((prev) => prev.filter((i) => i.slug !== slug))}
        />
      ))}
    </div>
  );
}
