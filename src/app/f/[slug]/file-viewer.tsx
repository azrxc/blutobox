"use client";

import { useEffect, useState } from "react";

type PreviewData = {
  url: string;
  mimeType: string;
  filename: string;
};

function PreviewMedia({ data }: { data: PreviewData }) {
  if (data.mimeType.startsWith("image/")) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={data.url} alt={data.filename} className="max-h-[70vh] max-w-full rounded-xl" />;
  }
  if (data.mimeType.startsWith("video/")) {
    return <video src={data.url} controls className="max-h-[70vh] max-w-full rounded-xl" />;
  }
  if (data.mimeType.startsWith("audio/")) {
    return <audio src={data.url} controls className="w-full" />;
  }
  return <p className="text-sm text-muted">No preview available for this file type.</p>;
}

export function FileViewer({ slug, isNsfw }: { slug: string; isNsfw: boolean }) {
  const [confirmed, setConfirmed] = useState(!isNsfw);
  const [data, setData] = useState<PreviewData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!confirmed) return;
    fetch(`/api/files/${slug}/preview-url`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load preview");
        return res.json();
      })
      .then(setData)
      .catch((e) => setError(e.message));
  }, [confirmed, slug]);

  if (!confirmed) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-8 text-center">
        <p className="text-sm font-medium">This file is flagged as NSFW / adult content.</p>
        <p className="text-xs text-muted">You must be 18 or older to view it.</p>
        <button
          onClick={() => setConfirmed(true)}
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-85"
        >
          I am 18+, show content
        </button>
      </div>
    );
  }

  if (error) return <p className="text-sm text-red-500">{error}</p>;
  if (!data) return <p className="text-sm text-muted">Loading preview…</p>;

  return <PreviewMedia data={data} />;
}
