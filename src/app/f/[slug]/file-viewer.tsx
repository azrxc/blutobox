"use client";

import { useEffect, useState } from "react";
import { LoadingIcon } from "../../loading-icon";

type PreviewData = {
  url: string;
  mimeType: string;
  filename: string;
};

const IMAGE_EXTS = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "avif"];
const VIDEO_EXTS = ["mp4", "webm", "mov", "mkv", "avi", "m4v"];
const AUDIO_EXTS = ["mp3", "wav", "ogg", "m4a", "flac", "aac"];

function getExt(filename: string) {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

function PreviewMedia({ data }: { data: PreviewData }) {
  const [failed, setFailed] = useState(false);
  const ext = getExt(data.filename);
  const isImage = data.mimeType.startsWith("image/") || IMAGE_EXTS.includes(ext);
  const isVideo = data.mimeType.startsWith("video/") || VIDEO_EXTS.includes(ext);
  const isAudio = data.mimeType.startsWith("audio/") || AUDIO_EXTS.includes(ext);

  if (failed) {
    return <p className="text-sm text-red-500">Failed to load preview. You can still download the file below.</p>;
  }

  if (isImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={data.url}
        alt={data.filename}
        className="max-h-[70vh] max-w-full rounded-xl"
        onError={() => setFailed(true)}
      />
    );
  }
  if (isVideo) {
    return (
      <video src={data.url} controls className="max-h-[70vh] max-w-full rounded-xl" onError={() => setFailed(true)} />
    );
  }
  if (isAudio) {
    return <audio src={data.url} controls className="w-full" onError={() => setFailed(true)} />;
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
  if (!data) {
    return (
      <div className="flex flex-col items-center gap-3 py-8">
        <LoadingIcon size={56} />
        <p className="text-sm text-muted">Loading preview…</p>
      </div>
    );
  }

  return <PreviewMedia data={data} />;
}
