"use client";

import { useState } from "react";

export function ReportForm({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, reason, reporterEmail: email }),
    });
    setStatus(res.ok ? "sent" : "error");
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-xs text-neutral-400 underline">
        Report this file (DMCA / abuse)
      </button>
    );
  }

  if (status === "sent") {
    return <p className="text-xs text-neutral-500">Report submitted. Thank you — we&apos;ll review it.</p>;
  }

  return (
    <form onSubmit={submit} className="space-y-2 rounded border p-3 text-left text-xs">
      <p className="font-medium">Report this file</p>
      {status === "error" && <p className="text-red-500">Something went wrong, try again.</p>}
      <input
        type="email"
        required
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded border px-2 py-1"
      />
      <textarea
        required
        minLength={10}
        placeholder="Reason (copyright infringement, illegal content, etc.)"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="w-full rounded border px-2 py-1"
        rows={3}
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={status === "sending"}
          className="rounded bg-black text-white px-3 py-1 disabled:opacity-50"
        >
          {status === "sending" ? "Submitting…" : "Submit report"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded border px-3 py-1">
          Cancel
        </button>
      </div>
    </form>
  );
}
