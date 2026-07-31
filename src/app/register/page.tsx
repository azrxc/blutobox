"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
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
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="max-w-sm text-center space-y-2">
          <h1 className="text-xl font-semibold">Check your email</h1>
          <p className="text-sm text-neutral-500">
            We sent a verification link to {email}. Redirecting you to login&hellip;
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-xl font-semibold">Create an account</h1>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-1">
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
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-black text-white py-2 text-sm font-medium disabled:opacity-50"
        >
          {loading ? "Creating account…" : "Sign up"}
        </button>
        <p className="text-sm text-neutral-500">
          Already have an account?{" "}
          <Link href="/login" className="underline">
            Log in
          </Link>
        </p>
      </form>
    </main>
  );
}
