import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { ReportActions } from "./report-actions";

export default async function AdminReportsPage() {
  const session = await requireAdmin();
  if (!session) redirect("/");

  const reports = await prisma.report.findMany({
    where: { status: "OPEN" },
    include: { file: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-16">
      <div className="w-full max-w-2xl space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">Open reports ({reports.length})</h1>
        {reports.length === 0 && <p className="text-sm text-muted">No open reports.</p>}
        <div className="space-y-3">
          {reports.map((report) => (
            <div key={report.id} className="space-y-3 rounded-2xl border border-border bg-surface p-5 text-sm">
              <p className="break-all font-medium">{report.file.filename}</p>
              <p className="text-xs text-muted">
                Reported by {report.reporterEmail} on {report.createdAt.toLocaleString()}
              </p>
              <p className="whitespace-pre-wrap rounded-lg bg-background p-3 text-xs">{report.reason}</p>
              <ReportActions reportId={report.id} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
