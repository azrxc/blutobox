"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type StorageData = {
  usedBytes: number;
  totalBytes: number;
  planTier: "FREE" | "PRO";
};

function formatGB(bytes: number) {
  return (bytes / (1024 * 1024 * 1024)).toFixed(2);
}

export function StorageUsageBar() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<StorageData | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/account/storage")
      .then((res) => (res.ok ? res.json() : null))
      .then(setData)
      .catch(() => {});
  }, [status]);

  if (!session?.user || !data) return null;

  const usedFraction = Math.min(1, data.usedBytes / data.totalBytes);

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-medium text-muted">Storage used</span>
        <span className="text-muted">
          {formatGB(data.usedBytes)} GB of {formatGB(data.totalBytes)} GB
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
        <div
          className={`h-full rounded-full ${usedFraction > 0.9 ? "bg-red-500" : "bg-accent"}`}
          style={{ width: `${usedFraction * 100}%` }}
        />
      </div>
    </div>
  );
}
