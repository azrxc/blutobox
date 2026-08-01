"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong");
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="max-w-sm space-y-2 text-center">
          <h1 className="text-xl font-semibold">Check your email</h1>
          <p className="text-sm text-muted">
            If an account exists for {email}, we sent a link to reset your password. It expires in 1 hour.
          </p>
          <Link href="/login" className="inline-block text-sm text-foreground underline underline-offset-2">
            Back to login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
        <div>
          <h1 className="text-xl font-semibold">Reset your password</h1>
          <p className="mt-1 text-sm text-muted">We&apos;ll email you a link to reset it.</p>
        </div>
        {error && (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none transition-colors focus:border-foreground/30"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-accent py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-85 disabled:opacity-40"
        >
          {loading ? "Sending…" : "Send reset link"}
        </button>
        <p className="text-center text-sm text-muted">
          <Link href="/login" className="text-foreground underline underline-offset-2">
            Back to login
          </Link>
        </p>
      </form>
    </main>
  );
}
