"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

type Row = {
  label: string;
  anon: string | boolean;
  free: string | boolean;
  pro: string | boolean;
};

const rows: Row[] = [
  { label: "Total storage", anon: "No account", free: "5 GB", pro: "50 GB" },
  { label: "Max file size", anon: "200 MB", free: "2 GB", pro: "10 GB" },
  { label: "Daily download limit", anon: "3 GB/day", free: "5 GB/day", pro: "25 GB/day" },
  { label: "Daily upload count limit", anon: "10/hour per IP", free: "50/day", pro: "200/day" },
  { label: "Inline preview & streaming", anon: true, free: true, pro: true },
  { label: "Password-protected links", anon: false, free: false, pro: true },
  { label: "Limit total downloads per link", anon: false, free: false, pro: true },
  { label: "Custom link name", anon: false, free: false, pro: true },
  { label: "Email me on first download", anon: false, free: true, pro: true },
  { label: "Multi-file bundling (.zip)", anon: true, free: true, pro: true },
  { label: "Link expiry", anon: "24h / 7d presets", free: "24h / 7d presets", pro: "Any custom duration" },
  { label: "Account & upload history", anon: false, free: true, pro: true },
  { label: "Creator links on your files", anon: false, free: "1 link", pro: "Up to 5 links" },
  { label: "Save other people's files to your account", anon: false, free: "Up to 10", pro: "Unlimited" },
  { label: "Inactive files auto-deleted", anon: "After 7 days unused", free: "After 30 days unused", pro: "Never" },
  { label: "QR code colors & logo", anon: false, free: false, pro: true },
  { label: "Video-to-GIF length", anon: "-", free: "Up to 10s, 20fps", pro: "Up to 60s, 30fps" },
  { label: "Image compressor batch size", anon: "-", free: "5 images", pro: "30 images" },
  { label: "Exact image resize", anon: false, free: false, pro: true },
  { label: "PDF merge page numbers", anon: false, free: false, pro: true },
  { label: "DOCX to PDF custom margins", anon: false, free: false, pro: true },
  { label: "Text diff HTML export", anon: false, free: false, pro: true },
];

const gridCols = "grid-cols-[1fr_4.5rem_4.5rem_4.5rem] sm:grid-cols-[1fr_6rem_6rem_6rem]";

function Cell({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return (
      <span className={value ? "text-foreground" : "text-muted/50"}>
        {value ? "✓" : "-"}
      </span>
    );
  }
  return <span className="text-muted">{value}</span>;
}

export default function PricingPage() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("yearly");

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
          className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-medium transition-colors ${
            billingInterval === "yearly" ? "bg-accent text-accent-foreground" : "text-muted hover:text-foreground"
          }`}
        >
          Yearly
          <span className="rounded-full bg-green-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-green-700 dark:text-green-400">
            Save 33%
          </span>
        </button>
      </div>

      <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-surface">
        <div className={`grid ${gridCols} items-end gap-x-2 px-4 pb-6 pt-6 text-sm sm:px-6`}>
          <div />
          <div className="text-center">
            <p className="text-xs font-medium text-muted">Anonymous</p>
            <p className="mt-1 text-xs text-muted">No signup</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-medium text-muted">Free</p>
            <p className="text-lg font-semibold sm:text-2xl">$0</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-medium text-muted">Pro</p>
            <p className="text-lg font-semibold sm:text-2xl">
              {billingInterval === "yearly" ? (
                <>
                  $39.99<span className="text-xs font-normal text-muted sm:text-sm">/yr</span>
                </>
              ) : (
                <>
                  $4.99<span className="text-xs font-normal text-muted sm:text-sm">/mo</span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="divide-y divide-border border-t border-border">
          {rows.map((row) => (
            <div
              key={row.label}
              className={`grid ${gridCols} items-center gap-x-2 px-4 py-3.5 text-xs sm:px-6 sm:text-sm`}
            >
              <span className="text-muted">{row.label}</span>
              <span className="text-center">
                <Cell value={row.anon} />
              </span>
              <span className="text-center">
                <Cell value={row.free} />
              </span>
              <span className="text-center">
                <Cell value={row.pro} />
              </span>
            </div>
          ))}
        </div>

        <div className={`grid ${gridCols} items-center gap-x-2 border-t border-border px-4 py-5 sm:px-6`}>
          <span />
          <span className="text-center">
            <Link href="/upload" className="text-xs text-muted underline underline-offset-2">
              Upload
            </Link>
          </span>
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
