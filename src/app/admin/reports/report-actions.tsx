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
        className="rounded bg-red-600 px-3 py-1 text-xs text-white disabled:opacity-50"
      >
        {loading === "remove" ? "Removing…" : "Remove file"}
      </button>
      <button
        onClick={() => act("dismiss")}
        disabled={loading !== null}
        className="rounded border px-3 py-1 text-xs disabled:opacity-50"
      >
        {loading === "dismiss" ? "Dismissing…" : "Dismiss"}
      </button>
    </div>
  );
}
