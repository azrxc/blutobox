import { Suspense } from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LogoutButton } from "./logout-button";
import { WelcomeToast } from "./welcome-toast";

// Don't show the trust-stats line until there's real traction to point to.
// A tiny number undercuts trust more than showing nothing at all.
const MIN_FILES_FOR_TRUST_STATS = 100;

const features = [
  {
    title: "No account needed",
    description: "Drop a file and get a link in seconds. Sign up only if you want more.",
  },
  {
    title: "Private by default",
    description: "Set a link to expire in 24h or 7 days for free, or password-protect it on Pro.",
  },
  {
    title: "Built to last",
    description: "Files stay up as long as they're used. No surprise deletions.",
  },
];

export default async function Home() {
  const session = await auth();
  const [user, totalFiles, downloadAgg] = await Promise.all([
    session?.user
      ? prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true, planTier: true } })
      : Promise.resolve(null),
    prisma.file.count(),
    prisma.file.aggregate({ _sum: { downloadCount: true } }),
  ]);
  const totalDownloads = downloadAgg._sum.downloadCount ?? 0;
  const showTrustStats = totalFiles >= MIN_FILES_FOR_TRUST_STATS;

  return (
    <main className="flex flex-1 flex-col">
      <Suspense fallback={null}>
        <WelcomeToast />
      </Suspense>
      <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Upload. Share. Done.
        </h1>
        <p className="mt-4 max-w-lg text-base text-muted sm:text-lg">
          A fast, simple file host. No clutter, no bloat, just a link you can send anywhere.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/upload"
            className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-85"
          >
            Upload a file
          </Link>
          <Link
            href="/pricing"
            className="rounded-full border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-surface"
          >
            See pricing
          </Link>
        </div>

        {showTrustStats && (
          <p className="mt-6 text-xs text-muted">
            {totalFiles.toLocaleString()} files shared · {totalDownloads.toLocaleString()} downloads served
          </p>
        )}

        {session?.user && user && (
          <div className="mt-10 flex items-center gap-3 text-sm text-muted">
            <span>
              Signed in as {user.name || session.user.email} · {user.planTier === "PRO" ? "Pro plan" : "Free plan"}
            </span>
            <LogoutButton />
          </div>
        )}
      </section>

      <section className="border-t border-border/80">
        <div className="mx-auto grid max-w-5xl gap-10 px-6 py-16 sm:grid-cols-3">
          {features.map((f) => (
            <div key={f.title}>
              <h2 className="text-sm font-semibold">{f.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.description}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
