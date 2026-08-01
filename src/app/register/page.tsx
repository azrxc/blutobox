"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreed) {
      setError("You must agree to the Terms and Privacy Policy");
      return;
    }
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong");
      return;
    }

    setSubmitted(true);
    setTimeout(() => router.push("/login"), 3000);
  }

  if (submitted) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="max-w-sm space-y-2 text-center">
          <h1 className="text-xl font-semibold">Check your email</h1>
          <p className="text-sm text-muted">
            We sent a verification link to {email}. Redirecting you to login&hellip;
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
        <div>
          <h1 className="text-xl font-semibold">Create an account</h1>
          <p className="mt-1 text-sm text-muted">Free to start.</p>
        </div>
        {error && (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="name">
            Name
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
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none transition-colors focus:border-foreground/30"
          />
        </div>
        <label className="flex items-start gap-2 text-xs text-muted">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-border"
          />
          <span>
            I agree to the{" "}
            <Link href="/terms" className="text-foreground underline underline-offset-2" target="_blank">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-foreground underline underline-offset-2" target="_blank">
              Privacy Policy
            </Link>
          </span>
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-accent py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-85 disabled:opacity-40"
        >
          {loading ? "Creating account…" : "Sign up"}
        </button>
        <p className="text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-foreground underline underline-offset-2">
            Log in
          </Link>
        </p>
      </form>
    </main>
  );
}
