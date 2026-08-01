"use client";

import { useEffect, useState } from "react";
import { UsageBar } from "./usage-bar";

type UsageData = {
  usedBytes: number;
  totalBytes: number;
};

function resetLabel() {
  const now = new Date();
  const nextMidnightUtc = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0)
  );
  const ms = nextMidnightUtc.getTime() - now.getTime();
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `Resets in ${hours}h ${minutes}m`;
}

export function DownloadUsageBar() {
  const [data, setData] = useState<UsageData | null>(null);

  useEffect(() => {
    fetch("/api/account/download-usage")
      .then((res) => (res.ok ? res.json() : null))
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data) return null;

  return (
    <UsageBar
      label="Download usage today"
      usedBytes={data.usedBytes}
      totalBytes={data.totalBytes}
      resetLabel={resetLabel()}
    />
  );
}
