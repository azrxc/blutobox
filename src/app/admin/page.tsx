import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { getUsageSeries } from "@/lib/site-stats";
import { B2_DAILY_STORAGE_CAP_BYTES, B2_DAILY_DOWNLOAD_CAP_BYTES } from "@/lib/limits";
import { UsageBar } from "../usage-bar";
import { UsageChart } from "./usage-chart";

function formatBytes(bytes: number) {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value.toFixed(1)} ${units[unit]}`;
}

function daysAgo(n: number) {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
    </div>
  );
}

export default async function AdminOverviewPage() {
  const session = await requireAdmin();
  if (!session) redirect("/");

  const sevenDaysAgo = daysAgo(7);

  const [
    totalUsers,
    proUsers,
    newUsersThisWeek,
    fileStats,
    activeSubs,
    openReportsCount,
    bannedIpCount,
    bannedUserCount,
    usageSeries,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { planTier: "PRO" } }),
    prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.file.aggregate({
      where: { status: "ACTIVE" },
      _count: { _all: true },
      _sum: { sizeBytes: true, downloadCount: true },
    }),
    prisma.subscription.findMany({
      where: { status: { in: ["active", "trialing"] } },
      select: { billingInterval: true },
    }),
    prisma.report.count({ where: { status: "OPEN" } }),
    prisma.bannedIp.count(),
    prisma.user.count({ where: { banned: true } }),
    getUsageSeries(30),
  ]);

  const totalStorageBytes = Number(fileStats._sum.sizeBytes ?? 0);
  const todayDownloadBytes = usageSeries[usageSeries.length - 1]?.downloadBytes ?? 0;

  const monthlySubs = activeSubs.filter((s) => s.billingInterval !== "yearly").length;
  const yearlySubs = activeSubs.filter((s) => s.billingInterval === "yearly").length;
  const estimatedMrr = monthlySubs * 4.99 + yearlySubs * (39.99 / 12);

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-16">
      <div className="w-full max-w-3xl space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Admin overview</h1>
          <div className="flex gap-4 text-sm">
            <Link href="/admin/reports" className="text-muted underline underline-offset-2 hover:text-foreground">
              Reports →
            </Link>
            <Link href="/admin/feedback" className="text-muted underline underline-offset-2 hover:text-foreground">
              Feedback →
            </Link>
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-muted">Users</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatCard label="Total accounts" value={totalUsers.toLocaleString()} />
            <StatCard label="Pro subscribers" value={proUsers.toLocaleString()} />
            <StatCard label="New this week" value={newUsersThisWeek.toLocaleString()} />
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-muted">Revenue (estimated)</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatCard label="Estimated MRR" value={`$${estimatedMrr.toFixed(2)}`} />
            <StatCard label="Monthly plans" value={monthlySubs.toLocaleString()} />
            <StatCard label="Yearly plans" value={yearlySubs.toLocaleString()} />
          </div>
          <p className="mt-2 text-xs text-muted">
            Estimated from active/trialing subscriptions at current list price. Doesn&apos;t account for Stripe fees,
            refunds, or price changes. Check Stripe Dashboard for exact figures.
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-muted">Files &amp; storage</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatCard label="Active files" value={(fileStats._count._all ?? 0).toLocaleString()} />
            <StatCard label="Total storage used" value={formatBytes(Number(fileStats._sum.sizeBytes ?? 0))} />
            <StatCard label="Total downloads" value={(fileStats._sum.downloadCount ?? 0).toLocaleString()} />
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-muted">Usage vs. B2 account caps</h2>
          <div className="space-y-2">
            <UsageBar label="Total storage" usedBytes={totalStorageBytes} totalBytes={B2_DAILY_STORAGE_CAP_BYTES} />
            <UsageBar label="Downloaded today" usedBytes={todayDownloadBytes} totalBytes={B2_DAILY_DOWNLOAD_CAP_BYTES} />
          </div>
          <p className="mt-2 text-xs text-muted">
            These are B2&apos;s account-wide &quot;Caps &amp; Alerts&quot; limits (set manually in B2&apos;s own
            dashboard, not visible via any API) — update the two constants in{" "}
            <code className="rounded bg-surface px-1 py-0.5">src/lib/limits.ts</code> if you change them there.
          </p>
          <div className="mt-4">
            <UsageChart points={usageSeries} />
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-muted">Moderation</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatCard label="Open reports" value={openReportsCount.toLocaleString()} sub={openReportsCount > 0 ? "Needs review" : undefined} />
            <StatCard label="Banned IPs" value={bannedIpCount.toLocaleString()} />
            <StatCard label="Banned accounts" value={bannedUserCount.toLocaleString()} />
          </div>
        </div>
      </div>
    </main>
  );
}
