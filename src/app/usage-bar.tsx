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
    <div className="rounded-xl border border-border bg-surface px-4 py-2.5">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="font-medium">{label}</span>
        <span className="text-muted">
          {percent}% · {formatGB(usedBytes)}/{formatGB(totalBytes)} GB
          {resetLabel ? ` · ${resetLabel}` : ""}
        </span>
      </div>
      <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-border">
        <div
          className={`h-full rounded-full ${usedFraction > 0.9 ? "bg-red-500" : "bg-accent"}`}
          style={{ width: `${usedFraction * 100}%` }}
        />
      </div>
    </div>
  );
}
