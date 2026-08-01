"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { GoogleSignInButton } from "../google-signin-button";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const verified = params.get("verified") === "1";
  const justReset = params.get("reset") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError(
        res.error === "email_not_verified"
          ? "Please verify your email before logging in — check your inbox for the verification link."
          : res.error === "too_many_attempts"
            ? "Too many login attempts from this network. Please try again in a few minutes."
            : "Invalid email or password"
      );
      return;
    }

    router.push("/?welcome=1");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
      <div>
        <h1 className="text-xl font-semibold">Log in</h1>
        <p className="mt-1 text-sm text-muted">Welcome back.</p>
      </div>
      {verified && (
        <p className="rounded-lg bg-green-500/10 px-3 py-2 text-sm text-green-700 dark:text-green-400">
          Email verified — you can log in now.
        </p>
      )}
      {justReset && (
        <p className="rounded-lg bg-green-500/10 px-3 py-2 text-sm text-green-700 dark:text-green-400">
          Password reset — you can log in with your new password now.
        </p>
      )}
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
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium" htmlFor="password">
            Password
          </label>
          <Link href="/forgot-password" className="text-xs text-muted underline underline-offset-2">
            Forgot password?
          </Link>
        </div>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none transition-colors focus:border-foreground/30"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-accent py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-85 disabled:opacity-40"
      >
        {loading ? "Logging in…" : "Log in"}
      </button>
      <GoogleSignInButton />
      <p className="text-center text-sm text-muted">
        Need an account?{" "}
        <Link href="/register" className="text-foreground underline underline-offset-2">
          Sign up
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
