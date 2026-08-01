"use client";

import { useEffect, useState } from "react";
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
  { label: "Daily download limit", free: "5 GB/day", pro: "25 GB/day" },
  { label: "Anonymous upload rate limit", free: "10/hour per IP", pro: "10/hour per IP" },
  { label: "Inline preview & streaming", free: true, pro: true },
  { label: "Password-protected links", free: false, pro: true },
  { label: "Custom link expiry", free: false, pro: true },
  { label: "Inactive files auto-deleted", free: "After 30 days unused", pro: "Never" },
];

const gridCols = "grid-cols-[1fr_5.5rem_5.5rem] sm:grid-cols-[1fr_7rem_7rem]";

function Cell({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return (
      <span className={value ? "text-foreground" : "text-muted/50"}>
        {value ? "✓" : "—"}
      </span>
    );
  }
  return <span className="text-muted">{value}</span>;
}

export default function PricingPage() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("monthly");

  useEffect(() => {
    update();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function upgrade() {
    setLoading(true);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interval: billingInterval }),
    });
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
    <main className="flex flex-1 flex-col items-center gap-10 px-6 py-16">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Pricing</h1>
        <p className="mt-2 text-sm text-muted">Simple, honest pricing. No surprises.</p>
      </div>

      <div className="inline-flex rounded-full border border-border p-1 text-xs">
        <button
          onClick={() => setBillingInterval("monthly")}
          className={`rounded-full px-3.5 py-1.5 font-medium transition-colors ${
            billingInterval === "monthly" ? "bg-accent text-accent-foreground" : "text-muted hover:text-foreground"
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setBillingInterval("yearly")}
          className={`rounded-full px-3.5 py-1.5 font-medium transition-colors ${
            billingInterval === "yearly" ? "bg-accent text-accent-foreground" : "text-muted hover:text-foreground"
          }`}
        >
          Yearly <span className="opacity-80">· Save 33%</span>
        </button>
      </div>

      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-surface">
        <div className={`grid ${gridCols} items-end gap-x-3 px-6 pb-6 pt-6 text-sm`}>
          <div />
          <div className="text-center">
            <p className="text-xs font-medium text-muted">Free</p>
            <p className="text-2xl font-semibold">$0</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-medium text-muted">Pro</p>
            <p className="text-2xl font-semibold">
              {billingInterval === "yearly" ? (
                <>
                  $39.99<span className="text-sm font-normal text-muted">/yr</span>
                </>
              ) : (
                <>
                  $4.99<span className="text-sm font-normal text-muted">/mo</span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="divide-y divide-border border-t border-border">
          {rows.map((row) => (
            <div
              key={row.label}
              className={`grid ${gridCols} items-center gap-x-3 px-6 py-3.5 text-sm`}
            >
              <span className="text-muted">{row.label}</span>
              <span className="text-center">
                <Cell value={row.free} />
              </span>
              <span className="text-center">
                <Cell value={row.pro} />
              </span>
            </div>
          ))}
        </div>

        <div className={`grid ${gridCols} items-center gap-x-3 border-t border-border px-6 py-5`}>
          <span />
          <span className="text-center">
            {!session?.user && (
              <Link href="/login" className="text-xs text-muted underline underline-offset-2">
                Log in
              </Link>
            )}
          </span>
          <span className="text-center">
            {!session?.user ? (
              <Link
                href="/login"
                className="inline-block rounded-full bg-accent px-4 py-2 text-xs font-medium text-accent-foreground transition-opacity hover:opacity-85"
              >
                Log in
              </Link>
            ) : isPro ? (
              <button
                onClick={manage}
                disabled={loading}
                className="rounded-full border border-border px-4 py-2 text-xs font-medium transition-colors hover:bg-background disabled:opacity-50"
              >
                Billing
              </button>
            ) : (
              <button
                onClick={upgrade}
                disabled={loading}
                className="rounded-full bg-accent px-4 py-2 text-xs font-medium text-accent-foreground transition-opacity hover:opacity-85 disabled:opacity-50"
              >
                {loading ? "…" : "Upgrade"}
              </button>
            )}
          </span>
        </div>
      </div>
    </main>
  );
}
