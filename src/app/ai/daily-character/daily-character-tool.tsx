"use client";

import { useEffect, useState } from "react";

type Character = { id: string; date: string; name: string; tagline: string; description: string; traits: string[]; portrait: string };
type SavedCharacter = Omit<Character, "date"> & { sourceDate: string; savedAt: string };

type State = {
  today: Character | null;
  claimedToday: boolean;
  currentStreak: number;
  longestStreak: number;
  saved: SavedCharacter[];
  maxSaved: number;
};

export function DailyCharacterTool() {
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<State | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/daily-character")
      .then((res) => res.json())
      .then((data) => setState(data))
      .catch(() => setError("Couldn't load today's character"))
      .finally(() => setLoading(false));
  }, []);

  async function handleClaim() {
    setError(null);
    setClaiming(true);
    try {
      const res = await fetch("/api/daily-character", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "claim" }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Couldn't claim today's streak");
      setState((prev) => (prev ? { ...prev, claimedToday: true, currentStreak: data.currentStreak, longestStreak: data.longestStreak } : prev));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't claim today's streak");
    } finally {
      setClaiming(false);
    }
  }

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/daily-character", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save" }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Couldn't save this character");
      setState((prev) => (prev ? { ...prev, saved: [data.saved, ...prev.saved] } : prev));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save this character");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/daily-character?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    setState((prev) => (prev ? { ...prev, saved: prev.saved.filter((c) => c.id !== id) } : prev));
    setConfirmingDeleteId(null);
  }

  if (loading) return <p className="text-sm text-muted">Loading…</p>;
  if (!state || !state.today) return <p className="text-sm text-red-500">{error ?? "Couldn't load today's character"}</p>;

  const { today } = state;
  const alreadySaved = state.saved.some((c) => c.sourceDate === today.date);
  const atSaveCap = state.saved.length >= state.maxSaved;

  return (
    <div className="w-full max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Daily Character</h1>
        <p className="mt-2 text-sm text-muted">
          A new AI-generated character every day, the same one for everyone. Come back daily to keep your streak
          going, and save your favorites to your collection.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">{today.name}</h2>
            <p className="text-sm italic text-muted">{today.tagline}</p>
          </div>
        </div>
        <p className="mt-3 text-sm leading-relaxed">{today.description}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {today.traits.map((trait) => (
            <span key={trait} className="rounded-full border border-border px-2.5 py-1 text-xs text-muted">
              {trait}
            </span>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted">
          <span className="font-medium">Portrait: </span>
          {today.portrait}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {state.claimedToday ? (
            <span className="rounded-full bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent">
              Claimed today · {state.currentStreak}-day streak
            </span>
          ) : (
            <button
              onClick={handleClaim}
              disabled={claiming}
              className="rounded-full bg-accent px-4 py-2 text-xs font-medium text-accent-foreground transition-opacity hover:opacity-85 disabled:opacity-50"
            >
              {claiming ? "Claiming…" : "Claim today's streak"}
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving || alreadySaved || atSaveCap}
            className="rounded-full border border-border px-4 py-2 text-xs font-medium transition-colors hover:bg-background disabled:opacity-50"
          >
            {alreadySaved ? "Saved" : saving ? "Saving…" : "Save to collection"}
          </button>
        </div>
        {state.longestStreak > 0 && (
          <p className="mt-2 text-xs text-muted">Longest streak: {state.longestStreak} days</p>
        )}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Your collection</h2>
          <span className="text-xs text-muted">
            {state.saved.length}/{state.maxSaved}
          </span>
        </div>
        {state.saved.length === 0 ? (
          <p className="mt-2 text-xs text-muted">Nothing saved yet - save a character you like to keep it here.</p>
        ) : (
          <div className="mt-2 space-y-2">
            {state.saved.map((c) => (
              <div key={c.id} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{c.name}</p>
                  <p className="truncate text-xs text-muted">{c.tagline}</p>
                </div>
                {confirmingDeleteId === c.id ? (
                  <div className="flex shrink-0 items-center gap-2 text-xs">
                    <button onClick={() => handleDelete(c.id)} className="font-medium text-red-600 underline hover:opacity-80 dark:text-red-400">
                      Delete
                    </button>
                    <button onClick={() => setConfirmingDeleteId(null)} className="text-muted underline hover:text-foreground">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmingDeleteId(c.id)}
                    className="shrink-0 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-500/10 dark:text-red-400"
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
