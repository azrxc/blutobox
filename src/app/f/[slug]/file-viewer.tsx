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
    return <img src={data.url} alt={data.filename} className="max-h-[70vh] max-w-full rounded" />;
  }
  if (data.mimeType.startsWith("video/")) {
    return <video src={data.url} controls className="max-h-[70vh] max-w-full rounded" />;
  }
  if (data.mimeType.startsWith("audio/")) {
    return <audio src={data.url} controls className="w-full" />;
  }
  return <p className="text-sm text-neutral-500">No preview available for this file type.</p>;
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
      <div className="flex flex-col items-center gap-3 rounded border border-red-300 bg-red-50 p-6 text-center dark:bg-red-950/20">
        <p className="text-sm font-medium">This file is flagged as NSFW / adult content.</p>
        <p className="text-xs text-neutral-500">You must be 18 or older to view it.</p>
        <button
          onClick={() => setConfirmed(true)}
          className="rounded bg-black text-white px-4 py-2 text-sm"
        >
          I am 18+, show content
        </button>
      </div>
    );
  }

  if (error) return <p className="text-sm text-red-500">{error}</p>;
  if (!data) return <p className="text-sm text-neutral-500">Loading preview…</p>;

  return <PreviewMedia data={data} />;
}
