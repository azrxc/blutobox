"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

type Row = {
  label: string;
  free: string | boolean;
  pro: string | boolean;
};

const rows: Row[] = [
  { label: "Total storage", free: "5 GB", pro: "50 GB" },
  { label: "Max file size", free: "2 GB", pro: "10 GB" },
  { label: "Anonymous upload rate limit", free: "10/hour per IP", pro: "10/hour per IP" },
  { label: "Inline preview & streaming", free: true, pro: true },
  { label: "Password-protected links", free: false, pro: true },
  { label: "Custom link expiry", free: false, pro: true },
  { label: "Inactive files auto-deleted", free: "After 30 days unused", pro: "Never" },
];

function Cell({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return (
      <span className={value ? "text-green-600" : "text-neutral-300 dark:text-neutral-700"}>
        {value ? "✓" : "✗"}
      </span>
    );
  }
  return <span>{value}</span>;
}

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
    <main className="flex flex-1 flex-col items-center gap-6 p-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Pricing</h1>
        <p className="text-sm text-neutral-500">Simple, honest pricing. No surprises.</p>
      </div>

      <div className="w-full max-w-2xl overflow-x-auto rounded border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-neutral-50 dark:bg-neutral-900">
              <th className="p-3 text-left font-medium">Feature</th>
              <th className="p-3 text-center font-medium">
                Free
                <div className="text-lg font-bold">$0</div>
              </th>
              <th className="p-3 text-center font-medium">
                Pro
                <div className="text-lg font-bold">$4.99/mo</div>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b last:border-0">
                <td className="p-3 text-neutral-600 dark:text-neutral-400">{row.label}</td>
                <td className="p-3 text-center">
                  <Cell value={row.free} />
                </td>
                <td className="p-3 text-center">
                  <Cell value={row.pro} />
                </td>
              </tr>
            ))}
            <tr>
              <td className="p-3"></td>
              <td className="p-3 text-center">
                {!session?.user && (
                  <Link href="/login" className="rounded border px-4 py-2 text-xs">
                    Log in
                  </Link>
                )}
              </td>
              <td className="p-3 text-center">
                {!session?.user ? (
                  <Link href="/login" className="rounded bg-black px-4 py-2 text-xs text-white">
                    Log in to upgrade
                  </Link>
                ) : isPro ? (
                  <button
                    onClick={manage}
                    disabled={loading}
                    className="rounded border px-4 py-2 text-xs disabled:opacity-50"
                  >
                    Manage subscription
                  </button>
                ) : (
                  <button
                    onClick={upgrade}
                    disabled={loading}
                    className="rounded bg-black px-4 py-2 text-xs text-white disabled:opacity-50"
                  >
                    {loading ? "Redirecting…" : "Upgrade to Pro"}
                  </button>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  );
}
