import { changelog } from "@/lib/changelog-data";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ChangelogPage() {
  return (
    <main className="mx-auto max-w-2xl flex-1 px-6 py-16">
      <div className="mb-10">
        <h1 className="text-2xl font-semibold tracking-tight">Changelog</h1>
        <p className="mt-1 text-sm text-muted">What&apos;s new at Bluto Box.</p>
      </div>

      <div className="space-y-10">
        {changelog.map((entry, i) => (
          <div key={i} className="border-l-2 border-border pl-5">
            <p className="text-xs text-muted">{formatDate(entry.date)}</p>
            <h2 className="mt-1 text-sm font-semibold">{entry.title}</h2>
            {entry.intro && <p className="mt-1.5 text-sm leading-relaxed text-muted">{entry.intro}</p>}
            {entry.highlights && (
              <ul className="mt-2 space-y-1 text-sm text-muted">
                {entry.highlights.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-foreground/40">·</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
