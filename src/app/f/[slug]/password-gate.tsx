"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PasswordGate({ slug }: { slug: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/files/${slug}/unlock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Incorrect password");
      return;
    }
    router.refresh();
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 text-center">
        <h1 className="text-lg font-semibold">This file is password-protected</h1>
        {error && (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        <input
          type="password"
          required
          autoFocus
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-center text-sm outline-none transition-colors focus:border-foreground/30"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-accent py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-85 disabled:opacity-40"
        >
          {loading ? "Checking…" : "Unlock"}
        </button>
      </form>
    </main>
  );
}
