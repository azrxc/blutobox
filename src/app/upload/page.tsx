"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { uploadFile } from "@/lib/upload-client";
import { CopyLinkField } from "../copy-link-field";

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
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div>
            <h1 className="text-xl font-semibold">Upload complete</h1>
            <p className="mt-1 text-sm text-muted">Your link is ready to share.</p>
          </div>
          <CopyLinkField url={shareUrl} />
          <div className="flex justify-center gap-3">
            <Link
              href={`/f/${shareSlug}`}
              className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-85"
            >
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
              className="rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-surface"
            >
              Upload another
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm space-y-6">
        <div>
          <h1 className="text-xl font-semibold">Upload a file</h1>
          <p className="mt-1 text-sm text-muted">Get a shareable link in seconds.</p>
        </div>

        {error && (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-surface px-6 py-10 text-center transition-colors hover:border-foreground/30">
          <span className="text-sm font-medium">{file ? file.name : "Choose a file"}</span>
          <span className="text-xs text-muted">{file ? "Click to change" : "or drag and drop"}</span>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            disabled={uploading}
            className="hidden"
          />
        </label>

        <label className="flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={isNsfw}
            onChange={(e) => setIsNsfw(e.target.checked)}
            disabled={uploading}
            className="h-4 w-4 rounded border-border"
          />
          This file contains NSFW / adult content
        </label>

        {isPro ? (
          <div className="space-y-3 rounded-xl border border-border bg-surface p-4">
            <p className="text-xs font-medium text-muted">Pro options</p>
            <div className="space-y-1">
              <label className="text-xs text-muted" htmlFor="linkPassword">
                Password-protect this link (optional)
              </label>
              <input
                id="linkPassword"
                type="text"
                value={linkPassword}
                onChange={(e) => setLinkPassword(e.target.value)}
                disabled={uploading}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted" htmlFor="expiresInHours">
                Link expires after (hours, optional)
              </label>
              <input
                id="expiresInHours"
                type="number"
                min={1}
                value={expiresInHours}
                onChange={(e) => setExpiresInHours(e.target.value)}
                disabled={uploading}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted">
            <Link href="/pricing" className="underline underline-offset-2">
              Upgrade to Pro
            </Link>{" "}
            to password-protect or set expiry on your links.
          </p>
        )}

        {uploading && (
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
        )}
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full rounded-full bg-accent py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-85 disabled:opacity-40"
        >
          {uploading ? `Uploading… ${Math.round(progress * 100)}%` : "Upload"}
        </button>
      </div>
    </main>
  );
}
