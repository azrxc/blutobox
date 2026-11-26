import { Suspense } from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LogoutButton } from "./logout-button";
import { WelcomeToast } from "./welcome-toast";
import { UploadTool } from "./upload-tool";
import { ANON_MAX_UPLOAD_BYTES, FREE_MAX_UPLOAD_BYTES } from "@/lib/limits";

function formatGB(bytes: number) {
  const gb = bytes / (1024 * 1024 * 1024);
  return gb >= 1 ? `${gb.toFixed(0)}GB` : `${Math.round(bytes / (1024 * 1024))}MB`;
}

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
    description: "Retention depends on your plan and link expiry. Review your options before sharing.",
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
      <section className="mx-auto w-full max-w-5xl px-4 pb-10 pt-14 sm:px-6 sm:pt-24">
        <div className="grid items-center gap-8 md:grid-cols-[1.15fr_0.85fr]">
          <div><p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted">Your everyday workspace</p><h1 className="max-w-xl text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">From first draft to final submission.</h1><p className="mt-5 max-w-lg text-base leading-relaxed text-muted sm:text-lg">Write, revise, create and share. Practical tools for students, creators and everyday work, wherever you are.</p>
          <div className="mt-7 flex flex-wrap gap-3"><Link href="/study#studio" className="rounded-xl bg-accent px-5 py-3 text-sm font-medium text-accent-foreground">Start studying →</Link><Link href="/file-converter" className="rounded-xl border border-border bg-surface px-5 py-3 text-sm font-medium">File tools</Link><Link href="/create" className="rounded-xl border border-border bg-surface px-5 py-3 text-sm font-medium">Create</Link></div><p className="mt-4 text-xs text-muted">Free file tools and writing examples. AI account limits apply.</p></div>
          <div className="rounded-3xl border border-border bg-surface p-5 sm:p-7"><p className="text-xs font-medium uppercase tracking-widest text-muted">Example · Natural writing</p><div className="mt-5 space-y-2"><p className="text-xs font-semibold text-muted">Before</p><p className="rounded-xl border border-border bg-background p-4 text-sm leading-relaxed">Students should do time management because it is important for them to finish their assignments.</p></div><div className="mt-4 space-y-2"><p className="text-xs font-semibold text-muted">After</p><p className="rounded-xl border border-border bg-background p-4 text-sm leading-relaxed">Managing time effectively helps students complete their assignments on schedule.</p></div><Link href="/study#studio" className="mt-5 inline-block text-sm font-medium underline underline-offset-4">Try with your own draft</Link><p className="mt-2 text-xs text-muted">Illustrative example, not a live AI result.</p></div>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">{[["Paraphrase","/study#studio"],["Grammar & natural writing","/study#studio"],["Assignment planner","/study#planner"],["Merge PDF","/file-converter/merge-pdf"],["Word to PDF","/file-converter/word-to-pdf"],["Photo editor","/create#photo"]].map(([name,href])=><Link key={name} href={href} className="rounded-xl border border-border bg-surface p-4 text-sm font-medium hover:bg-accent/5">{name} <span aria-hidden="true" className="text-muted">↗</span></Link>)}</div>
      </section>
      <section id="share" className="border-t border-border/80"><div className="mx-auto grid max-w-5xl items-center gap-8 px-4 py-12 sm:px-6 md:grid-cols-2"><div><h2 className="text-2xl font-semibold tracking-tight">Share files in seconds.</h2><p className="mt-3 text-sm text-muted">Up to {formatGB(ANON_MAX_UPLOAD_BYTES)} without an account, {formatGB(FREE_MAX_UPLOAD_BYTES)} with a free one. Drop files or choose them from your device.</p><div className="mt-4 flex flex-wrap gap-4 text-sm"><Link href="/upload" className="underline underline-offset-4">Open file sharing</Link><Link href="/pricing" className="underline underline-offset-4">Compare plans</Link><Link href="/install" className="underline underline-offset-4">Install app</Link></div>{showTrustStats&&<p className="mt-4 text-xs text-muted">{totalFiles.toLocaleString()} files shared · {totalDownloads.toLocaleString()} downloads served</p>}{session?.user&&user&&<div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted"><span>Signed in as {user.name || session.user.email}</span><LogoutButton/></div>}</div><div className="flex justify-center"><UploadTool compact/></div></div></section>
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

      <section className="border-t border-border/80">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-xl font-semibold tracking-tight">Bluto Box Study</h2>
            <Link href="/study" className="text-sm underline underline-offset-2">Open study workspace</Link>
          </div>
          <p className="mt-2 text-sm text-muted">Write, revise and get assignments ready for submission.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              ["Paraphrase & natural writing","Improve your draft without losing your voice.","/study#studio"],
              ["Revision tools","Summarize notes and generate practice questions.","/study#studio"],
              ["Assignment planner","Keep your deadlines organized.","/study#planner"],
            ].map(([title,description,href]) => <Link key={title} href={href} className="rounded-2xl border border-border bg-surface p-5 hover:bg-accent/5"><h3 className="font-semibold">{title}</h3><p className="mt-2 text-sm text-muted">{description}</p></Link>)}
          </div>
        </div>
      </section>
      <section className="border-t border-border/80"><div className="mx-auto max-w-5xl px-6 py-12"><h2 className="text-xl font-semibold">Bluto Box Create</h2><p className="mt-2 text-sm text-muted">Edit photos, create social posts and make QR codes.</p><div className="mt-5 grid gap-3 sm:grid-cols-3">{[["/create#photo","Photo editor","Crop, adjust and remove solid backgrounds."],["/qr","QR codes","Turn links into scannable codes."],["/create#social","Creator tools","Aesthetic text and profit calculator."]].map(([href,title,desc])=><Link key={href} href={href} className="rounded-2xl border bg-surface p-5 hover:bg-accent/5"><h3 className="font-semibold">{title}</h3><p className="mt-2 text-sm text-muted">{desc}</p></Link>)}</div></div></section>
    </main>
  );
}
