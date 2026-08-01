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
  slug: string | null;
};

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

  async function handleDelete() {
    if (!confirm(`Delete "${file.filename}"? This cannot be undone.`)) return;
    setDeleting(true);
    const res = await fetch(`/api/account/files/${file.id}`, { method: "DELETE" });
    setDeleting(false);
    if (res.ok) router.refresh();
    else alert("Failed to delete file");
  }

  return (
    <div className="flex items-center justify-between gap-3 border-b border-border py-4 text-sm last:border-0">
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
        </p>
      </div>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="shrink-0 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-500/10 disabled:opacity-50 dark:text-red-400"
      >
        {deleting ? "Deleting…" : "Delete"}
      </button>
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
