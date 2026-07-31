"use client";

import { useState } from "react";
import Link from "next/link";
import { uploadFile } from "@/lib/upload-client";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isNsfw, setIsNsfw] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareSlug, setShareSlug] = useState<string | null>(null);

  async function handleUpload() {
    if (!file) return;
    setError(null);
    setUploading(true);
    setProgress(0);
    try {
      const { slug } = await uploadFile(file, isNsfw, setProgress);
      setShareSlug(slug);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  if (shareSlug) {
    const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/f/${shareSlug}` : `/f/${shareSlug}`;
    return (
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-4 text-center">
          <h1 className="text-xl font-semibold">Upload complete</h1>
          <input
            readOnly
            value={shareUrl}
            onFocus={(e) => e.currentTarget.select()}
            className="w-full rounded border px-3 py-2 text-sm text-center"
          />
          <div className="flex justify-center gap-3">
            <Link href={`/f/${shareSlug}`} className="rounded bg-black text-white px-4 py-2 text-sm">
              View file
            </Link>
            <button
              onClick={() => {
                setFile(null);
                setShareSlug(null);
                setProgress(0);
              }}
              className="rounded border px-4 py-2 text-sm"
            >
              Upload another
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-xl font-semibold">Upload a file</h1>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          disabled={uploading}
          className="w-full text-sm"
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isNsfw}
            onChange={(e) => setIsNsfw(e.target.checked)}
            disabled={uploading}
          />
          This file contains NSFW / adult content
        </label>
        {uploading && (
          <div className="h-2 w-full overflow-hidden rounded bg-neutral-200">
            <div
              className="h-full bg-black transition-all"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
        )}
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full rounded bg-black text-white py-2 text-sm font-medium disabled:opacity-50"
        >
          {uploading ? `Uploading… ${Math.round(progress * 100)}%` : "Upload"}
        </button>
      </div>
    </main>
  );
}
