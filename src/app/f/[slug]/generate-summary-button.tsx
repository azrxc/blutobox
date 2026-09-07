"use client";

import { useEffect, useState } from "react";

export function GenerateSummaryButton({ slug }: { slug: string }) {
  const [quota, setQuota] = useState<{ used: number; limit: number } | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/files/${slug}/summary-quota`)
      .then((res) => res.json())
      .then((data) => setQuota({ used: data.used, limit: data.limit }))
      .catch(() => {});
  }, [slug]);

  async function handleGenerate() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/files/${slug}/generate-summary`, { method: "POST" });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error ?? `Couldn't generate a summary (status ${res.status})`);
      }
      setSummary(data.summary);
      setQuota((q) => (q ? { used: Math.min(q.used + 1, q.limit), limit: q.limit } : q));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't generate a summary");
    } finally {
      setLoading(false);
    }
  }

  if (summary) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-4">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">AI summary</h2>
        <p className="mt-1.5 text-sm">{summary}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">AI summary</h2>
      <p className="mt-1.5 text-xs text-muted">
        Not sure what this file actually is? Get a quick AI-generated summary of its contents before downloading.
      </p>
      {error && (
        <p className="mt-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={handleGenerate}
          disabled={loading || (quota !== null && quota.used >= quota.limit)}
          className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-85 disabled:opacity-60"
        >
          {loading ? "Generating…" : "Generate AI summary"}
        </button>
        {quota && (
          <span className="text-xs text-muted">
            {quota.used}/{quota.limit} today
          </span>
        )}
      </div>
    </div>
  );
}
