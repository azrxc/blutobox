"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

export function UpdateNameForm({ currentName }: { currentName: string | null }) {
  const { update } = useSession();
  const [name, setName] = useState(currentName ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError(null);
    const res = await fetch("/api/account/update-name", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong");
      setStatus("error");
      return;
    }
    await update();
    setStatus("done");
  }

  return (
    <form onSubmit={submit} className="max-w-sm space-y-4">
      <h2 className="text-sm font-semibold">Name</h2>
      {status === "done" && (
        <p className="rounded-lg bg-green-500/10 px-3 py-2 text-sm text-green-700 dark:text-green-400">
          Name updated.
        </p>
      )}
      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <div className="space-y-1.5">
        <label className="text-xs text-muted" htmlFor="name">
          Display name
        </label>
        <input
          id="name"
          type="text"
          required
          maxLength={100}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none transition-colors focus:border-foreground/30"
        />
      </div>
      <button
        type="submit"
        disabled={status === "saving"}
        className="rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-surface disabled:opacity-50"
      >
        {status === "saving" ? "Saving…" : "Update name"}
      </button>
    </form>
  );
}
