import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export default async function AdminFeedbackPage() {
  const session = await requireAdmin();
  if (!session) redirect("/");

  const feedback = await prisma.cancellationFeedback.findMany({
    include: { user: { select: { email: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-16">
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Cancellation feedback ({feedback.length})</h1>
          <div className="flex gap-4 text-sm">
            <Link href="/admin" className="text-muted underline underline-offset-2">
              Overview →
            </Link>
            <Link href="/admin/reports" className="text-muted underline underline-offset-2">
              Reports →
            </Link>
          </div>
        </div>
        {feedback.length === 0 && <p className="text-sm text-muted">No feedback yet.</p>}
        <div className="space-y-3">
          {feedback.map((f) => (
            <div key={f.id} className="space-y-2 rounded-2xl border border-border bg-surface p-5 text-sm">
              <div className="flex items-center justify-between">
                <p className="font-medium">{f.reason ?? "No reason given"}</p>
                <p className="text-xs text-muted">{f.createdAt.toLocaleString()}</p>
              </div>
              <p className="text-xs text-muted">{f.user.email}</p>
              {f.comment && (
                <p className="whitespace-pre-wrap rounded-lg bg-background p-3 text-xs">{f.comment}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
