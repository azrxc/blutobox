"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export type AccountFile = {
  id: string;
  filename: string;
  sizeBytes: string;
  downloadCount: number;
  createdAt: string;
  daysUntilDeletion: number | null;
  linkExpiresAt: string | null;
  slug: string | null;
};

function formatLinkExpiry(iso: string | null) {
  if (!iso) return "Link never expires";
  const date = new Date(iso);
  if (date.getTime() <= Date.now()) return "Link expired";
  return `Link expires ${date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;
}

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

function FileRow({ file }: { file: AccountFile }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    const res = await fetch(`/api/account/files/${file.id}`, { method: "DELETE" });
    setDeleting(false);
    if (res.ok) {
      router.refresh();
    } else {
      setError("Failed to delete file");
      setConfirming(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 border-b border-border py-4 text-sm last:border-0 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
      <div className="min-w-0 flex-1">
        {file.slug ? (
          <Link href={`/f/${file.slug}`} className="break-all font-medium underline underline-offset-2">
            {file.filename}
          </Link>
        ) : (
          <span className="break-all font-medium">{file.filename}</span>
        )}
        <p className="mt-0.5 text-xs text-muted">
          {formatBytes(file.sizeBytes)} · {file.downloadCount} downloads ·{" "}
          {file.daysUntilDeletion === null
            ? "Never auto-deleted (Pro)"
            : file.daysUntilDeletion <= 0
              ? "Pending deletion"
              : `Auto-deletes in ${file.daysUntilDeletion} day${file.daysUntilDeletion === 1 ? "" : "s"} if unused`}
          {" · "}
          {formatLinkExpiry(file.linkExpiresAt)}
        </p>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
      {confirming ? (
        <div className="flex shrink-0 items-center gap-2 text-xs">
          <span className="text-muted">Delete?</span>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="font-medium text-red-600 underline transition-colors hover:opacity-80 disabled:opacity-50 dark:text-red-400"
          >
            {deleting ? "…" : "Yes"}
          </button>
          <button
            onClick={() => setConfirming(false)}
            disabled={deleting}
            className="text-muted underline transition-colors hover:text-foreground"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          className="shrink-0 self-end rounded-full border border-border px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-500/10 dark:text-red-400 sm:self-auto"
        >
          Delete
        </button>
      )}
    </div>
  );
}

export function FileList({ files }: { files: AccountFile[] }) {
  if (files.length === 0) {
    return <p className="py-5 text-sm text-muted">You haven&apos;t uploaded any files yet.</p>;
  }
  return (
    <div>
      {files.map((f) => (
        <FileRow key={f.id} file={f} />
      ))}
    </div>
  );
}
