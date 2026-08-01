"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { uploadFile, UploadCancelledError } from "@/lib/upload-client";
import { zipFiles } from "@/lib/zip-files";
import { CopyLinkField } from "../copy-link-field";
import { StorageUsageBar } from "../storage-usage-bar";
import { QrCodeButton } from "../qr-code-button";

const RISKY_EXTENSIONS = [".exe", ".scr", ".bat", ".cmd", ".com", ".msi", ".vbs", ".ps1"];

function formatBytes(bytes: number) {
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value.toFixed(1)} ${units[unit]}`;
}

function hasRiskyExtension(files: File[]) {
  return files.some((f) => RISKY_EXTENSIONS.some((ext) => f.name.toLowerCase().endsWith(ext)));
}

export default function UploadPage() {
  const { data: session, update } = useSession();
  const isPro = session?.user?.planTier === "PRO";

  useEffect(() => {
    update();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [files, setFiles] = useState<File[]>([]);
  const [isNsfw, setIsNsfw] = useState(false);
  const [linkPassword, setLinkPassword] = useState("");
  const [expiryChoice, setExpiryChoice] = useState("");
  const [customHours, setCustomHours] = useState("");
  const [zipping, setZipping] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareSlug, setShareSlug] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  function resolveExpiryHours(): number | undefined {
    if (expiryChoice === "custom") {
      return customHours ? Number(customHours) : undefined;
    }
    return expiryChoice ? Number(expiryChoice) : undefined;
  }

  async function handleUpload() {
    if (files.length === 0) return;
    setError(null);
    setUploading(true);
    setProgress(0);
    const controller = new AbortController();
    abortControllerRef.current = controller;
    try {
      let fileToUpload = files[0];
      if (files.length > 1) {
        setZipping(true);
        fileToUpload = await zipFiles(files);
        setZipping(false);
      }
      const { slug } = await uploadFile(
        fileToUpload,
        {
          isNsfw,
          linkPassword: isPro ? linkPassword : undefined,
          expiresInHours: resolveExpiryHours(),
        },
        setProgress,
        controller.signal
      );
      setShareSlug(slug);
    } catch (e) {
      if (e instanceof UploadCancelledError) {
        setProgress(0);
      } else {
        setError(e instanceof Error ? e.message : "Upload failed");
      }
    } finally {
      setZipping(false);
      setUploading(false);
      abortControllerRef.current = null;
    }
  }

  function handleCancel() {
    abortControllerRef.current?.abort();
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function resetForm() {
    setFiles([]);
    setShareSlug(null);
    setProgress(0);
    setLinkPassword("");
    setExpiryChoice("");
    setCustomHours("");
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
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href={`/f/${shareSlug}`}
              className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-85"
            >
              View file
            </Link>
            <QrCodeButton url={shareUrl} />
            <button
              onClick={resetForm}
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

        <StorageUsageBar />

        {error && (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-surface px-6 py-10 text-center transition-colors hover:border-foreground/30">
          <span className="text-sm font-medium">
            {files.length > 0 ? `${files.length} file${files.length > 1 ? "s" : ""} selected` : "Choose files"}
          </span>
          <span className="text-xs text-muted">{files.length > 0 ? "Click to change" : "or drag and drop"}</span>
          <input
            type="file"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
            disabled={uploading}
            className="hidden"
          />
        </label>

        {files.length > 1 && (
          <p className="text-xs text-muted">
            Multiple files will be bundled into one .zip and shared as a single link.
          </p>
        )}

        {files.length > 0 && (
          <ul className="space-y-1.5 rounded-xl border border-border bg-surface p-3">
            {files.map((f, i) => (
              <li key={`${f.name}-${i}`} className="flex items-center justify-between gap-2 text-xs">
                <span className="truncate">
                  {f.name} <span className="text-muted">· {formatBytes(f.size)}</span>
                </span>
                <button
                  onClick={() => removeFile(i)}
                  disabled={uploading}
                  className="shrink-0 text-muted transition-colors hover:text-foreground"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}

        {hasRiskyExtension(files) && (
          <p className="rounded-lg bg-yellow-500/10 px-3 py-2 text-xs text-yellow-800 dark:text-yellow-300">
            One of your files is an executable type. Make sure whoever downloads it trusts the source.
          </p>
        )}

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

        <details className="group rounded-xl border border-border bg-surface">
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium marker:content-none">
            <span>Options</span>
            <span className="text-muted transition-transform group-open:rotate-180">⌄</span>
          </summary>
          <div className="space-y-3 border-t border-border p-4">
            <div className="space-y-1">
              <label className="text-xs text-muted" htmlFor="expiryChoice">
                Link expires
              </label>
              <select
                id="expiryChoice"
                value={expiryChoice}
                onChange={(e) => setExpiryChoice(e.target.value)}
                disabled={uploading}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">Never</option>
                <option value="24">24 hours</option>
                <option value="168">7 days</option>
                {isPro && <option value="custom">Custom…</option>}
              </select>
            </div>
            {isPro && expiryChoice === "custom" && (
              <div className="space-y-1">
                <label className="text-xs text-muted" htmlFor="customHours">
                  Custom expiry (hours)
                </label>
                <input
                  id="customHours"
                  type="number"
                  min={1}
                  value={customHours}
                  onChange={(e) => setCustomHours(e.target.value)}
                  disabled={uploading}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
            )}

            {isPro ? (
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
            ) : (
              <p className="text-xs text-muted">
                <Link href="/pricing" className="underline underline-offset-2">
                  Upgrade to Pro
                </Link>{" "}
                to password-protect links or set a custom expiry.
              </p>
            )}
          </div>
        </details>

        {(uploading || zipping) && (
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: zipping ? "100%" : `${Math.round(progress * 100)}%` }}
            />
          </div>
        )}

        {uploading ? (
          <div className="flex gap-3">
            <button
              disabled
              className="flex-1 rounded-full bg-accent py-3 text-sm font-medium text-accent-foreground opacity-40"
            >
              {zipping ? "Compressing…" : `Uploading… ${Math.round(progress * 100)}%`}
            </button>
            <button
              onClick={handleCancel}
              className="rounded-full border border-border px-5 py-3 text-sm font-medium transition-colors hover:bg-surface"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={handleUpload}
            disabled={files.length === 0}
            className="w-full rounded-full bg-accent py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-85 disabled:opacity-40"
          >
            Upload
          </button>
        )}
      </div>
    </main>
  );
}
