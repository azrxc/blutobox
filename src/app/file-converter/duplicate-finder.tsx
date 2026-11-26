"use client";

import { useState } from "react";
import { FileDropZone } from "../file-drop-zone";

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

function bufferToHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

type Group = { hash: string; files: File[] };

export function DuplicateFinder() {
  const [files, setFiles] = useState<File[]>([]);
  const [checking, setChecking] = useState(false);
  const [groups, setGroups] = useState<Group[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCheck() {
    if (files.length < 2) return;
    setChecking(true);
    setError(null);
    setGroups(null);
    try {
      const byHash = new Map<string, File[]>();
      for (const file of files) {
        const buffer = await file.arrayBuffer();
        const digest = await crypto.subtle.digest("SHA-256", buffer);
        const hash = bufferToHex(digest);
        byHash.set(hash, [...(byHash.get(hash) ?? []), file]);
      }
      const dupes = Array.from(byHash.entries())
        .filter(([, group]) => group.length > 1)
        .map(([hash, group]) => ({ hash, files: group }));
      setGroups(dupes);
    } catch {
      setError("Couldn't check these files for duplicates");
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-surface p-5">
      <FileDropZone  multiple disabled={checking} title={files.length ? `${files.length} files selected` : "Drop files here"} hint="Choose at least two files" onFiles={picked=>{setFiles(picked);setGroups(null);}} />

      {error && <p className="text-xs text-red-500">{error}</p>}

      <button
        onClick={handleCheck}
        disabled={files.length < 2 || checking}
        className="w-full rounded-full bg-accent py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-85 disabled:opacity-40"
      >
        {checking ? "Checking…" : "Find duplicates"}
      </button>

      {groups && (
        <div className="space-y-3 border-t border-border pt-4 text-sm">
          {groups.length === 0 ? (
            <p className="text-xs text-muted">No duplicates found, every file is unique.</p>
          ) : (
            groups.map((g) => (
              <div key={g.hash} className="space-y-1 rounded-lg border border-border bg-background p-3">
                <p className="text-xs font-medium">
                  {g.files.length} identical files ({formatBytes(g.files[0].size)} each)
                </p>
                <ul className="space-y-0.5 text-xs text-muted">
                  {g.files.map((f, i) => (
                    <li key={i} className="truncate">
                      {f.name}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
