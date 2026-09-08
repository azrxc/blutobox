import Link from "next/link";

export type CompareRow = { label: string; blutobox: string | boolean; competitor: string | boolean };
export type WhyPoint = { title: string; body: string };

export type ComparisonPageProps = {
  competitorName: string;
  rows: CompareRow[];
  whySwitch: WhyPoint[];
  sourceNote: string;
};

function Cell({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return <span className={value ? "text-foreground" : "text-muted/50"}>{value ? "✓" : "-"}</span>;
  }
  return <span>{value}</span>;
}

export function ComparisonPage({ competitorName, rows, whySwitch, sourceNote }: ComparisonPageProps) {
  return (
    <main className="flex flex-1 flex-col items-center gap-12 px-6 py-16">
      <div className="max-w-xl text-center">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">Comparison</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          A {competitorName} alternative without the catch
        </h1>
        <p className="mt-3 text-sm text-muted">
          It does the same job: upload a file, get a link, share it. Just with clearer limits, and you don&apos;t need an account to start.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/upload"
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-85"
          >
            Upload a file now
          </Link>
          <Link
            href="/pricing"
            className="rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-surface"
          >
            See Pro plans
          </Link>
        </div>
      </div>

      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="grid grid-cols-[1fr_6.5rem_6.5rem] items-center gap-x-2 border-b border-border px-4 py-4 text-xs font-medium sm:px-6 sm:text-sm">
          <span />
          <span className="text-center text-foreground">Bluto Box</span>
          <span className="text-center text-muted">{competitorName}</span>
        </div>
        <div className="divide-y divide-border">
          {rows.map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-[1fr_6.5rem_6.5rem] items-center gap-x-2 px-4 py-3.5 text-xs sm:px-6 sm:text-sm"
            >
              <span className="text-muted">{row.label}</span>
              <span className="text-center font-medium">
                <Cell value={row.blutobox} />
              </span>
              <span className="text-center text-muted">
                <Cell value={row.competitor} />
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid w-full max-w-2xl gap-6 sm:grid-cols-3">
        {whySwitch.map((point) => (
          <div key={point.title}>
            <h2 className="text-sm font-semibold">{point.title}</h2>
            <p className="mt-1.5 text-xs leading-relaxed text-muted">{point.body}</p>
          </div>
        ))}
      </div>

      <p className="max-w-2xl text-center text-[11px] text-muted/70">{sourceNote}</p>
    </main>
  );
}
