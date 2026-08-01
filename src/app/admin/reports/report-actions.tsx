"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ReportActions({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"remove" | "dismiss" | null>(null);

  async function act(action: "remove" | "dismiss") {
    setLoading(action);
    await fetch(`/api/admin/reports/${reportId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => act("remove")}
        disabled={loading !== null}
        className="rounded-full bg-red-600 px-3.5 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-85 disabled:opacity-50"
      >
        {loading === "remove" ? "Removing…" : "Remove file"}
      </button>
      <button
        onClick={() => act("dismiss")}
        disabled={loading !== null}
        className="rounded-full border border-border px-3.5 py-1.5 text-xs font-medium transition-colors hover:bg-background disabled:opacity-50"
      >
        {loading === "dismiss" ? "Dismissing…" : "Dismiss"}
      </button>
    </div>
  );
}
