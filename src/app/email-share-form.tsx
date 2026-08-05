"use client";

import { useState } from "react";

export function EmailShareForm({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    const res = await fetch("/api/share/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, recipientEmail: email, message: message || undefined }),
    });
    if (res.ok) {
      setStatus("sent");
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to send");
      setStatus("error");
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-background"
      >
        Email this link
      </button>
    );
  }

  if (status === "sent") {
    return <p className="w-full text-sm text-muted">Sent to {email}.</p>;
  }

  return (
    <form
      onSubmit={handleSend}
      className="w-full space-y-2.5 rounded-xl border border-border bg-surface p-4 text-left text-sm"
    >
      {error && <p className="text-xs text-red-500">{error}</p>}
      <input
        type="email"
        required
        placeholder="Recipient's email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
      />
      <textarea
        placeholder="Add a message (optional)"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        maxLength={500}
        rows={2}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={status === "sending"}
          className="rounded-full bg-accent px-4 py-2 text-xs font-medium text-accent-foreground transition-opacity hover:opacity-85 disabled:opacity-50"
        >
          {status === "sending" ? "Sending…" : "Send"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-full border border-border px-4 py-2 text-xs font-medium transition-colors hover:bg-background"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
