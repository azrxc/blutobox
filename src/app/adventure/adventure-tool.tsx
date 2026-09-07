"use client";

import { useEffect, useRef, useState } from "react";

type Turn = { role: "narrator" | "player"; content: string };
type Adventure = { id: string; scenario: string; turns: Turn[]; turnCount: number };

const PRESETS = [
  { label: "Fantasy quest", scenario: "A young adventurer sets out from a quiet village after a strange light is seen over the old forest." },
  { label: "Sci-fi mystery", scenario: "You wake up on a research station orbiting a gas giant. The rest of the crew is missing." },
  { label: "Haunted mansion", scenario: "You've inherited a large, old house from a relative you never met. The first night, you hear footsteps upstairs." },
  { label: "Detective noir", scenario: "You're a private investigator in a rain-soaked city, hired to find a client's missing brother." },
];

export function AdventureTool() {
  const [loading, setLoading] = useState(true);
  const [adventure, setAdventure] = useState<Adventure | null>(null);
  const [quota, setQuota] = useState<{ used: number; limit: number } | null>(null);
  const [customScenario, setCustomScenario] = useState("");
  const [actionInput, setActionInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingNew, setConfirmingNew] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/adventure")
      .then((res) => res.json())
      .then((data) => {
        setAdventure(data.adventure);
        setQuota({ used: data.used, limit: data.limit });
      })
      .catch(() => setError("Couldn't load your adventure"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [adventure?.turns.length]);

  const quotaExhausted = quota !== null && quota.used >= quota.limit;

  async function handleStart(scenario: string) {
    if (!scenario.trim() || sending || quotaExhausted) return;
    setError(null);
    setSending(true);
    try {
      const res = await fetch("/api/adventure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start", scenario: scenario.trim() }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Couldn't start the adventure");
      setAdventure(data.adventure);
      setQuota({ used: data.used, limit: data.limit });
      setCustomScenario("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't start the adventure");
    } finally {
      setSending(false);
    }
  }

  async function handleContinue() {
    const message = actionInput.trim();
    if (!message || sending || quotaExhausted) return;
    setError(null);
    setSending(true);
    try {
      const res = await fetch("/api/adventure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "continue", message }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Couldn't continue the adventure");
      setAdventure(data.adventure);
      setQuota({ used: data.used, limit: data.limit });
      setActionInput("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't continue the adventure");
    } finally {
      setSending(false);
    }
  }

  async function handleStartNew() {
    setSending(true);
    try {
      await fetch("/api/adventure", { method: "DELETE" });
      setAdventure(null);
      setConfirmingNew(false);
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-muted">Loading…</p>;
  }

  if (!adventure) {
    return (
      <div className="w-full max-w-lg space-y-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">AI Text Adventure</h1>
          <p className="mt-2 text-sm text-muted">
            Pick a starting scenario, or write your own. The story continues based on whatever you type next, so no
            two playthroughs are the same.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => handleStart(preset.scenario)}
              disabled={sending || quotaExhausted}
              className="rounded-xl border border-border bg-surface px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-accent/10 disabled:opacity-50"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4">
          <label htmlFor="custom-scenario" className="text-xs font-semibold uppercase tracking-wide text-muted">
            Or write your own
          </label>
          <textarea
            id="custom-scenario"
            value={customScenario}
            onChange={(e) => setCustomScenario(e.target.value)}
            maxLength={300}
            rows={3}
            placeholder="You're the last lighthouse keeper on a coast where ships have started disappearing..."
            className="mt-2 w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <button
            onClick={() => handleStart(customScenario)}
            disabled={sending || quotaExhausted || !customScenario.trim()}
            className="mt-3 rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-85 disabled:opacity-50"
          >
            {sending ? "Starting…" : "Begin"}
          </button>
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}
        {quota && (
          <p className="text-xs text-muted">
            {quotaExhausted
              ? "Daily adventure limit reached. Come back tomorrow."
              : `${quota.used}/${quota.limit} turns used today`}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-lg flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight">Your adventure</h1>
        {confirmingNew ? (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted">Abandon this story?</span>
            <button onClick={handleStartNew} disabled={sending} className="font-medium text-red-600 underline hover:opacity-80 dark:text-red-400">
              Yes
            </button>
            <button onClick={() => setConfirmingNew(false)} className="text-muted underline hover:text-foreground">
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmingNew(true)}
            className="text-xs font-medium text-muted underline underline-offset-2 hover:text-foreground"
          >
            Start new adventure
          </button>
        )}
      </div>

      <div ref={scrollRef} className="max-h-[28rem] space-y-3 overflow-y-auto rounded-2xl border border-border bg-surface p-4">
        {adventure.turns.map((turn, i) =>
          turn.role === "narrator" ? (
            <p key={i} className="text-sm leading-relaxed">
              {turn.content}
            </p>
          ) : (
            <p key={i} className="text-sm italic text-muted">
              &gt; {turn.content}
            </p>
          )
        )}
        {sending && <p className="text-sm text-muted">The story continues…</p>}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {quotaExhausted ? (
        <p className="text-sm text-muted">Daily adventure limit reached. Come back tomorrow to continue the story.</p>
      ) : (
        <div className="flex items-center gap-2">
          <input
            value={actionInput}
            onChange={(e) => setActionInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleContinue()}
            maxLength={500}
            disabled={sending}
            placeholder="What do you do?"
            className="flex-1 rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent disabled:opacity-60"
          />
          <button
            onClick={handleContinue}
            disabled={sending || !actionInput.trim()}
            className="shrink-0 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-85 disabled:opacity-50"
          >
            Go
          </button>
        </div>
      )}

      {quota && <p className="text-xs text-muted">{quota.used}/{quota.limit} turns used today</p>}
    </div>
  );
}
