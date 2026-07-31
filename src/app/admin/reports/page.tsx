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
    <main className="flex flex-1 flex-col gap-4 p-6">
      <h1 className="text-xl font-semibold">Open reports ({reports.length})</h1>
      {reports.length === 0 && (
        <p className="text-sm text-neutral-500">No open reports.</p>
      )}
      <div className="space-y-3">
        {reports.map((report) => (
          <div key={report.id} className="space-y-2 rounded border p-4 text-sm">
            <p className="break-all font-medium">{report.file.filename}</p>
            <p className="text-xs text-neutral-500">
              Reported by {report.reporterEmail} on {report.createdAt.toLocaleString()}
            </p>
            <p className="whitespace-pre-wrap rounded bg-neutral-50 p-2 text-xs dark:bg-neutral-900">
              {report.reason}
            </p>
            <ReportActions reportId={report.id} />
          </div>
        ))}
      </div>
    </main>
  );
}
