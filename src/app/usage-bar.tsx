function formatGB(bytes: number) {
  return (bytes / (1024 * 1024 * 1024)).toFixed(2);
}

export function UsageBar({
  label,
  usedBytes,
  totalBytes,
  resetLabel,
}: {
  label: string;
  usedBytes: number;
  totalBytes: number;
  resetLabel?: string;
}) {
  const usedFraction = totalBytes > 0 ? Math.min(1, usedBytes / totalBytes) : 0;
  const percent = Math.round(usedFraction * 100);

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-2xl font-semibold tracking-tight">{percent}%</p>
          <p className="mt-0.5 text-xs text-muted">{label}</p>
        </div>
        <p className="text-xs text-muted">
          {formatGB(usedBytes)} GB of {formatGB(totalBytes)} GB
        </p>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-border">
        <div
          className={`h-full rounded-full ${usedFraction > 0.9 ? "bg-red-500" : "bg-accent"}`}
          style={{ width: `${usedFraction * 100}%` }}
        />
      </div>
      {resetLabel && <p className="mt-2 text-xs text-muted">{resetLabel}</p>}
    </div>
  );
}
