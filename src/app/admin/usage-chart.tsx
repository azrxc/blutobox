type Point = { date: string; uploadBytes: number; downloadBytes: number };

function formatGB(bytes: number) {
  return (bytes / (1024 * 1024 * 1024)).toFixed(2);
}

function Bars({ label, values, color }: { label: string; values: { date: string; bytes: number }[]; color: string }) {
  const max = Math.max(1, ...values.map((p) => p.bytes));
  const total = values.reduce((sum, p) => sum + p.bytes, 0);

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between text-xs">
        <span className="font-medium">{label}</span>
        <span className="text-muted">{formatGB(total)} GB over {values.length} days</span>
      </div>
      <div className="flex h-20 items-end gap-px">
        {values.map((p) => (
          <div
            key={p.date}
            title={`${p.date}: ${formatGB(p.bytes)} GB`}
            className={`min-w-0 flex-1 rounded-t-sm ${color}`}
            style={{ height: `${p.bytes > 0 ? Math.max(2, (p.bytes / max) * 100) : 0}%` }}
          />
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-muted">
        <span>{values[0]?.date}</span>
        <span>{values[values.length - 1]?.date}</span>
      </div>
    </div>
  );
}

export function UsageChart({ points }: { points: Point[] }) {
  return (
    <div className="space-y-6 rounded-2xl border border-border bg-surface p-5">
      <Bars label="Uploaded" values={points.map((p) => ({ date: p.date, bytes: p.uploadBytes }))} color="bg-accent" />
      <Bars
        label="Downloaded"
        values={points.map((p) => ({ date: p.date, bytes: p.downloadBytes }))}
        color="bg-accent/50"
      />
    </div>
  );
}
