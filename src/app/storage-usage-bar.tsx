"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { UsageBar } from "./usage-bar";

type StorageData = {
  usedBytes: number;
  totalBytes: number;
  planTier: "FREE" | "PRO";
};

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

  return <UsageBar label="Storage used" usedBytes={data.usedBytes} totalBytes={data.totalBytes} />;
}
