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

export function FileViewer({ slug }: { slug: string }) {
  const [data, setData] = useState<PreviewData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/files/${slug}/preview-url`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load preview");
        return res.json();
      })
      .then(setData)
      .catch((e) => setError(e.message));
  }, [slug]);

  if (error) return <p className="text-sm text-red-500">{error}</p>;
  if (!data) return <p className="text-sm text-muted">Loading preview…</p>;

  return <PreviewMedia data={data} />;
}
