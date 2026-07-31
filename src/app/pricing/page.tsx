"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function PricingPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  async function upgrade() {
    setLoading(true);
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (data.url) window.location.href = data.url;
  }

  async function manage() {
    setLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (data.url) window.location.href = data.url;
  }

  const isPro = session?.user?.planTier === "PRO";

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-3 rounded border p-6">
          <h2 className="text-lg font-semibold">Free</h2>
          <p className="text-2xl font-bold">$0</p>
          <ul className="space-y-1 text-sm text-neutral-500">
            <li>2GB max file size</li>
            <li>Standard upload speed</li>
          </ul>
        </div>
        <div className="space-y-3 rounded border-2 border-black p-6">
          <h2 className="text-lg font-semibold">Pro</h2>
          <p className="text-2xl font-bold">$4.99/mo</p>
          <ul className="space-y-1 text-sm text-neutral-500">
            <li>10GB max file size</li>
            <li>Priority support</li>
          </ul>
          {!session?.user ? (
            <Link href="/login" className="block rounded bg-black px-4 py-2 text-center text-sm text-white">
              Log in to upgrade
            </Link>
          ) : isPro ? (
            <button
              onClick={manage}
              disabled={loading}
              className="w-full rounded border px-4 py-2 text-sm disabled:opacity-50"
            >
              Manage subscription
            </button>
          ) : (
            <button
              onClick={upgrade}
              disabled={loading}
              className="w-full rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {loading ? "Redirecting…" : "Upgrade to Pro"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
