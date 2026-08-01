"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong");
      return;
    }

    router.push("/login?reset=1");
  }

  if (!token) {
    return (
      <div className="max-w-sm space-y-2 text-center">
        <h1 className="text-xl font-semibold">Invalid link</h1>
        <p className="text-sm text-muted">
          This reset link is missing its token.{" "}
          <Link href="/forgot-password" className="text-foreground underline underline-offset-2">
            Request a new one
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
      <div>
        <h1 className="text-xl font-semibold">Set a new password</h1>
      </div>
      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="newPassword">
          New password
        </label>
        <input
          id="newPassword"
          type="password"
          required
          minLength={8}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none transition-colors focus:border-foreground/30"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-accent py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-85 disabled:opacity-40"
      >
        {loading ? "Saving…" : "Reset password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}
