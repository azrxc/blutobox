import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { ReportActions } from "./report-actions";

export default async function AdminReportsPage() {
  const session = await requireAdmin();
  if (!session) redirect("/");

  const reports = await prisma.report.findMany({
    where: { status: "OPEN" },
    include: { file: { include: { shareLinks: { take: 1 } } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-16">
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Open reports ({reports.length})</h1>
          <div className="flex gap-4 text-sm">
            <Link href="/admin" className="text-muted underline underline-offset-2">
              Overview →
            </Link>
            <Link href="/admin/feedback" className="text-muted underline underline-offset-2">
              Feedback →
            </Link>
          </div>
        </div>
        {reports.length === 0 && <p className="text-sm text-muted">No open reports.</p>}
        <div className="space-y-3">
          {reports.map((report) => {
            const slug = report.file.shareLinks[0]?.slug;
            return (
              <div key={report.id} className="space-y-3 rounded-2xl border border-border bg-surface p-5 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="break-all font-medium">{report.file.filename}</p>
                  {slug ? (
                    <Link
                      href={`/f/${slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 rounded-full border border-border px-3.5 py-1.5 text-xs font-medium transition-colors hover:bg-background"
                    >
                      View file →
                    </Link>
                  ) : (
                    <span className="shrink-0 text-xs text-muted">No active link</span>
                  )}
                </div>
                <p className="text-xs text-muted">
                  Reported by {report.reporterEmail} on {report.createdAt.toLocaleString()}
                </p>
                <p className="whitespace-pre-wrap rounded-lg bg-background p-3 text-xs">{report.reason}</p>
                <ReportActions reportId={report.id} />
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
