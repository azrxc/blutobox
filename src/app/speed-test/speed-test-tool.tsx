"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

const TEST_SIZE_BYTES = 26214400; // 25 MiB, must match the server route

function formatMBs(bytesPerSecond: number) {
  return (bytesPerSecond / (1024 * 1024)).toFixed(1);
}

export function SpeedTestTool() {
  const { data: session } = useSession();
  const isPro = session?.user?.planTier === "PRO";

  const [running, setRunning] = useState(false);
  const [liveSpeed, setLiveSpeed] = useState<number | null>(null);
  const [result, setResult] = useState<{ mbps: number; seconds: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runTest() {
    setRunning(true);
    setError(null);
    setResult(null);
    setLiveSpeed(null);
    const start = performance.now();
    let lastTick = start;
    let lastBytes = 0;

    try {
      const res = await fetch("/api/speed-test/download");
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? `Speed test failed (status ${res.status})`);
      }

      const reader = res.body.getReader();
      let loaded = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        loaded += value.byteLength;
        const now = performance.now();
        if (now - lastTick > 300) {
          const instantSpeed = ((loaded - lastBytes) / ((now - lastTick) / 1000));
          setLiveSpeed(instantSpeed);
          lastTick = now;
          lastBytes = loaded;
        }
      }

      const totalSeconds = (performance.now() - start) / 1000;
      setResult({ mbps: loaded / totalSeconds, seconds: totalSeconds });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Speed test failed");
    } finally {
      setRunning(false);
      setLiveSpeed(null);
    }
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Download speed test</h1>
        <p className="mt-1 text-sm text-muted">
          Downloads a {(TEST_SIZE_BYTES / (1024 * 1024)).toFixed(0)}MB test file to measure your real transfer
          speed from Bluto Box.
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {running && (
        <div className="rounded-2xl border border-border bg-surface p-6 text-center">
          <p className="text-3xl font-semibold tabular-nums">
            {liveSpeed !== null ? formatMBs(liveSpeed) : "…"}
          </p>
          <p className="mt-1 text-xs text-muted">MB/s (live)</p>
        </div>
      )}

      {result && !running && (
        <div className="rounded-2xl border border-border bg-surface p-6 text-center">
          <p className="text-3xl font-semibold tabular-nums">{formatMBs(result.mbps)}</p>
          <p className="mt-1 text-xs text-muted">MB/s average, over {result.seconds.toFixed(1)}s</p>
          <p className="mt-3 text-xs text-muted">
            {isPro
              ? "Full Pro speed - unthrottled, direct from storage."
              : "This is Free-tier speed (capped, ~8MB/s). "}
            {!isPro && (
              <Link href="/pricing" className="underline underline-offset-2">
                Upgrade to Pro
              </Link>
            )}
            {!isPro && " for full, unthrottled speed."}
          </p>
        </div>
      )}

      <button
        onClick={runTest}
        disabled={running}
        className="w-full rounded-full bg-accent py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-85 disabled:opacity-40"
      >
        {running ? "Testing…" : result ? "Test again" : "Start speed test"}
      </button>

      <p className="text-center text-xs text-muted">Counts against your normal daily download limit.</p>
    </div>
  );
}
