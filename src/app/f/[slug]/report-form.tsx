"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

export function ReportForm({ slug }: { slug: string }) {
  const { data: session } = useSession();
  const accountEmail = session?.user?.email ?? null;

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
      body: JSON.stringify({ slug, reason, reporterEmail: accountEmail ?? email }),
    });
    setStatus(res.ok ? "sent" : "error");
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-xs text-muted underline underline-offset-2">
        Report this file (DMCA / abuse)
      </button>
    );
  }

  if (status === "sent") {
    return <p className="text-xs text-muted">Report submitted. Thank you, we&apos;ll review it.</p>;
  }

  return (
    <form onSubmit={submit} className="space-y-2.5 rounded-xl border border-border bg-surface p-4 text-left text-xs">
      <p className="font-medium">Report this file</p>
      {status === "error" && <p className="text-red-500">Something went wrong, try again.</p>}
      {accountEmail ? (
        <p className="rounded-lg border border-border bg-background px-3 py-2 text-muted">
          Reporting as <span className="text-foreground">{accountEmail}</span>
        </p>
      ) : (
        <input
          type="email"
          required
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2"
        />
      )}
      <textarea
        required
        minLength={10}
        placeholder="Reason (copyright infringement, illegal content, etc.)"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="w-full rounded-lg border border-border bg-background px-3 py-2"
        rows={3}
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={status === "sending"}
          className="rounded-full bg-accent px-3.5 py-1.5 font-medium text-accent-foreground transition-opacity hover:opacity-85 disabled:opacity-50"
        >
          {status === "sending" ? "Submitting…" : "Submit report"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-full border border-border px-3.5 py-1.5 font-medium transition-colors hover:bg-background"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
