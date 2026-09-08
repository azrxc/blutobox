"use client";

import { useEffect, useRef, useState } from "react";

type Turn = { role: "narrator" | "player"; content: string; choices?: string[]; critical?: boolean };
type Adventure = {
  id: string;
  scenario: string;
  turns: Turn[];
  turnCount: number;
  statLabel: string | null;
  statValue: number;
  ended: boolean;
  won: boolean;
  lastPlayedAt: string;
};

const PRESETS = [
  { label: "Fantasy quest", scenario: "A young adventurer sets out from a quiet village after a strange light is seen over the old forest." },
  { label: "Sci-fi mystery", scenario: "You wake up on a research station orbiting a gas giant. The rest of the crew is missing." },
  { label: "Haunted mansion", scenario: "You've inherited a large, old house from a relative you never met. The first night, you hear footsteps upstairs." },
  { label: "Detective noir", scenario: "You're a private investigator in a rain-soaked city, hired to find a client's missing brother." },
];

function previewLine(adventure: Adventure) {
  const firstNarratorTurn = adventure.turns.find((t) => t.role === "narrator");
  return firstNarratorTurn?.content.slice(0, 90) ?? adventure.scenario.slice(0, 90);
}

export function AdventureTool() {
  const [loading, setLoading] = useState(true);
  const [adventures, setAdventures] = useState<Adventure[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [quota, setQuota] = useState<{ used: number; limit: number; maxSaved: number } | null>(null);
  const [customScenario, setCustomScenario] = useState("");
  const [actionInput, setActionInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const openAdventure = adventures.find((a) => a.id === openId) ?? null;

  useEffect(() => {
    fetch("/api/adventure")
      .then((res) => res.json())
      .then((data) => {
        setAdventures(data.adventures ?? []);
        setQuota({ used: data.used, limit: data.limit, maxSaved: data.maxSaved });
      })
      .catch(() => setError("Couldn't load your adventures"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [openAdventure?.turns.length]);

  const quotaExhausted = quota !== null && quota.used >= quota.limit;
  const atSaveCap = quota !== null && adventures.length >= quota.maxSaved;

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
      setAdventures((prev) => [data.adventure, ...prev]);
      setOpenId(data.adventure.id);
      setShowPicker(false);
      setQuota((q) => (q ? { ...q, used: data.used } : q));
      setCustomScenario("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't start the adventure");
    } finally {
      setSending(false);
    }
  }

  async function handleContinue(override?: string) {
    const message = (override ?? actionInput).trim();
    if (!message || sending || quotaExhausted || !openAdventure) return;
    setError(null);
    setSending(true);
    try {
      const res = await fetch("/api/adventure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "continue", adventureId: openAdventure.id, message }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Couldn't continue the adventure");
      setAdventures((prev) => [data.adventure, ...prev.filter((a) => a.id !== data.adventure.id)]);
      setQuota((q) => (q ? { ...q, used: data.used } : q));
      setActionInput("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't continue the adventure");
    } finally {
      setSending(false);
    }
  }

  async function handleDelete(id: string) {
    setSending(true);
    try {
      await fetch(`/api/adventure?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      setAdventures((prev) => prev.filter((a) => a.id !== id));
      if (openId === id) setOpenId(null);
      setConfirmingDeleteId(null);
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-muted">Loading…</p>;
  }

  if (showPicker || adventures.length === 0) {
    return (
      <div className="w-full max-w-lg space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">AI Text Adventure</h1>
            <p className="mt-2 text-sm text-muted">
              Pick a starting scenario, or write your own. A meter (Trust, Health, Sanity - the AI picks one that
              fits) tracks how things are going based on what you choose, and the story continues from there, so no
              two playthroughs are the same.
            </p>
          </div>
          {adventures.length > 0 && (
            <button onClick={() => setShowPicker(false)} className="shrink-0 text-xs text-muted underline underline-offset-2 hover:text-foreground">
              Back
            </button>
          )}
        </div>

        {atSaveCap ? (
          <p className="text-sm text-muted">
            You've reached your limit of {quota?.maxSaved} saved adventures. Delete one from your list before
            starting a new one.
          </p>
        ) : (
          <>
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
          </>
        )}

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

  if (!openAdventure) {
    return (
      <div className="w-full max-w-lg space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Your adventures</h1>
          <button
            onClick={() => setShowPicker(true)}
            disabled={atSaveCap}
            className="rounded-full bg-accent px-4 py-2 text-xs font-medium text-accent-foreground transition-opacity hover:opacity-85 disabled:opacity-50"
          >
            New adventure
          </button>
        </div>

        <div className="space-y-2">
          {adventures.map((adventure) => (
            <div key={adventure.id} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
              <button onClick={() => setOpenId(adventure.id)} className="min-w-0 flex-1 text-left">
                <p className="truncate text-sm font-medium">{previewLine(adventure)}…</p>
                <p className="mt-0.5 text-xs text-muted">
                  {adventure.turnCount} turn{adventure.turnCount === 1 ? "" : "s"}
                  {adventure.ended && (adventure.won ? " · Won" : " · Ended")}
                </p>
              </button>
              {confirmingDeleteId === adventure.id ? (
                <div className="flex shrink-0 items-center gap-2 text-xs">
                  <button onClick={() => handleDelete(adventure.id)} disabled={sending} className="font-medium text-red-600 underline hover:opacity-80 dark:text-red-400">
                    Delete
                  </button>
                  <button onClick={() => setConfirmingDeleteId(null)} className="text-muted underline hover:text-foreground">
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmingDeleteId(adventure.id)}
                  className="shrink-0 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-500/10 dark:text-red-400"
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>

        {quota && (
          <p className="text-xs text-muted">
            {adventures.length}/{quota.maxSaved} saved adventures ·{" "}
            {quotaExhausted ? "daily turn limit reached" : `${quota.used}/${quota.limit} turns used today`}
          </p>
        )}
      </div>
    );
  }

  const lastTurn = openAdventure.turns[openAdventure.turns.length - 1];
  const lastChoices = !openAdventure.ended && lastTurn?.role === "narrator" ? lastTurn.choices : undefined;
  const isCritical = !openAdventure.ended && lastTurn?.role === "narrator" && lastTurn.critical === true;

  return (
    <div className="flex w-full max-w-lg flex-col gap-4">
      <div className="flex items-center justify-between">
        <button onClick={() => setOpenId(null)} className="text-xs font-medium text-muted underline underline-offset-2 hover:text-foreground">
          Back to your adventures
        </button>
        {confirmingDeleteId === openAdventure.id ? (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted">Delete this story?</span>
            <button onClick={() => handleDelete(openAdventure.id)} disabled={sending} className="font-medium text-red-600 underline hover:opacity-80 dark:text-red-400">
              Yes
            </button>
            <button onClick={() => setConfirmingDeleteId(null)} className="text-muted underline hover:text-foreground">
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmingDeleteId(openAdventure.id)}
            className="text-xs font-medium text-muted underline underline-offset-2 hover:text-foreground"
          >
            Delete
          </button>
        )}
      </div>

      {openAdventure.statLabel && (
        <div>
          <div className="flex items-center justify-between text-xs text-muted">
            <span className="font-medium">{openAdventure.statLabel}</span>
            <span>{openAdventure.statValue}/100</span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-border">
            <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${openAdventure.statValue}%` }} />
          </div>
        </div>
      )}

      <div
        ref={scrollRef}
        className={`max-h-[28rem] space-y-3 overflow-y-auto rounded-2xl border p-4 transition-colors ${
          isCritical ? "border-red-500/40 bg-red-500/5" : "border-border bg-surface"
        }`}
      >
        {openAdventure.turns.map((turn, i) =>
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

      {openAdventure.ended ? (
        <p className={`text-sm font-medium ${openAdventure.won ? "text-emerald-600 dark:text-emerald-400" : "text-muted"}`}>
          {openAdventure.won
            ? "You made it. The story ends here, on a high note."
            : "The story ends here."}{" "}
          <button onClick={() => setShowPicker(true)} className="underline underline-offset-2">
            Start a new adventure
          </button>
        </p>
      ) : quotaExhausted ? (
        <p className="text-sm text-muted">Daily adventure limit reached. Come back tomorrow to continue the story.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {isCritical && (
            <p className="text-xs font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">
              No time to think, pick one now
            </p>
          )}
          {lastChoices && lastChoices.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {lastChoices.map((choice, i) => (
                <button
                  key={i}
                  onClick={() => handleContinue(choice)}
                  disabled={sending}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
                    isCritical
                      ? "border-red-500/40 bg-red-500/10 hover:bg-red-500/20"
                      : "border-border bg-surface hover:bg-accent/10"
                  }`}
                >
                  {choice}
                </button>
              ))}
            </div>
          )}
          {!isCritical && (
            <div className="flex items-center gap-2">
              <input
                value={actionInput}
                onChange={(e) => setActionInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleContinue()}
                maxLength={500}
                disabled={sending}
                placeholder="Or write your own action..."
                className="flex-1 rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent disabled:opacity-60"
              />
              <button
                onClick={() => handleContinue()}
                disabled={sending || !actionInput.trim()}
                className="shrink-0 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-85 disabled:opacity-50"
              >
                Go
              </button>
            </div>
          )}
        </div>
      )}

      {quota && <p className="text-xs text-muted">{quota.used}/{quota.limit} turns used today</p>}
    </div>
  );
}
