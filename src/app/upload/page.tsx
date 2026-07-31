"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { uploadFile } from "@/lib/upload-client";

export default function UploadPage() {
  const { data: session } = useSession();
  const isPro = session?.user?.planTier === "PRO";

  const [file, setFile] = useState<File | null>(null);
  const [isNsfw, setIsNsfw] = useState(false);
  const [linkPassword, setLinkPassword] = useState("");
  const [expiresInHours, setExpiresInHours] = useState<string>("");
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
      const { slug } = await uploadFile(
        file,
        {
          isNsfw,
          linkPassword: isPro ? linkPassword : undefined,
          expiresInHours: isPro && expiresInHours ? Number(expiresInHours) : undefined,
        },
        setProgress
      );
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
                setLinkPassword("");
                setExpiresInHours("");
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

        {isPro ? (
          <div className="space-y-2 rounded border p-3">
            <p className="text-xs font-medium text-neutral-500">Pro options</p>
            <div className="space-y-1">
              <label className="text-xs" htmlFor="linkPassword">
                Password-protect this link (optional)
              </label>
              <input
                id="linkPassword"
                type="text"
                value={linkPassword}
                onChange={(e) => setLinkPassword(e.target.value)}
                disabled={uploading}
                className="w-full rounded border px-2 py-1 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs" htmlFor="expiresInHours">
                Link expires after (hours, optional)
              </label>
              <input
                id="expiresInHours"
                type="number"
                min={1}
                value={expiresInHours}
                onChange={(e) => setExpiresInHours(e.target.value)}
                disabled={uploading}
                className="w-full rounded border px-2 py-1 text-sm"
              />
            </div>
          </div>
        ) : (
          <p className="text-xs text-neutral-400">
            <Link href="/pricing" className="underline">
              Upgrade to Pro
            </Link>{" "}
            to password-protect or set expiry on your links.
          </p>
        )}

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
