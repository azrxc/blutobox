import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Bluto Box vs Other File Hosts | Bluto Box",
  description: "How Bluto Box compares to Gofile, WeTransfer, and Mega for free file uploads and sharing.",
};

const COMPARISONS = [
  {
    href: "/gofile-alternative",
    title: "vs Gofile",
    description: "No ad-gated downloads, and daily limits you can actually see up front.",
  },
  {
    href: "/wetransfer-alternative",
    title: "vs WeTransfer",
    description: "No 3-day expiry and no 10-transfers-per-month ceiling on the free plan.",
  },
  {
    href: "/mega-alternative",
    title: "vs Mega",
    description: "A daily quota tied to your account, not a 6-hour window shared by your whole network.",
  },
  {
    href: "/pixeldrain-alternative",
    title: "vs Pixeldrain",
    description: "A Pro plan under half the price, with a flat quota instead of a per-file bandwidth pool.",
  },
  {
    href: "/buzzheavier-alternative",
    title: "vs Buzzheavier",
    description: "No ads around your downloads, and a file that doesn't need to go viral to stay online.",
  },
];

export default function ComparePage() {
  return (
    <main className="flex flex-1 flex-col items-center px-6 py-16">
      <div className="w-full max-w-3xl space-y-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Bluto Box vs other file hosts</h1>
          <p className="mt-2 text-sm text-muted">
            These do the same basic job: upload a file, get a link, share it. Here&apos;s where the free tiers
            actually differ.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {COMPARISONS.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-5 transition-colors hover:bg-accent/5"
            >
              <h2 className="text-base font-semibold">{c.title}</h2>
              <p className="text-sm text-muted">{c.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
