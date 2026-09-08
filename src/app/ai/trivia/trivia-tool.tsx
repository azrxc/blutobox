"use client";

import { useEffect, useState } from "react";
import { LoadingIcon } from "../../loading-icon";

type Question = { question: string; options: string[]; category: string };
type CommunityStats = { players: number; averageScore: number };

type State = {
  playedToday: boolean;
  questions: Question[];
  correctIndices: number[] | null;
  yourAnswers: number[] | null;
  score: number | null;
  total: number;
  currentStreak: number;
  longestStreak: number;
  communityStats: CommunityStats | null;
};

export function TriviaTool() {
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<State | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [picks, setPicks] = useState<(number | null)[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/trivia")
      .then((res) => res.json())
      .then((data: State) => {
        setState(data);
        setPicks(new Array(data.questions.length).fill(null));
      })
      .catch(() => setError("Couldn't load today's trivia"))
      .finally(() => setLoading(false));
  }, []);

  function pick(questionIndex: number, optionIndex: number) {
    setPicks((prev) => {
      const next = [...prev];
      next[questionIndex] = optionIndex;
      return next;
    });
  }

  async function handleSubmit() {
    if (picks.some((p) => p === null)) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/trivia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "submit", answers: picks }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Couldn't submit your answers");
      setState((prev) =>
        prev
          ? {
              ...prev,
              playedToday: true,
              yourAnswers: picks as number[],
              correctIndices: data.correctIndices,
              score: data.score,
              currentStreak: data.currentStreak,
              longestStreak: data.longestStreak,
              communityStats: data.communityStats,
            }
          : prev
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't submit your answers");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-8">
        <LoadingIcon size={40} />
        <p className="text-sm text-muted">Loading today&apos;s trivia…</p>
      </div>
    );
  }
  if (error && !state) {
    return <p className="text-sm text-red-600 dark:text-red-400">{error}</p>;
  }
  if (!state) return null;

  const allPicked = picks.every((p) => p !== null);

  return (
    <div className="w-full max-w-lg space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Daily Trivia</h1>
        <p className="mt-1 text-sm text-muted">5 questions, the same ones for everyone today.</p>
      </div>

      {state.playedToday && (
        <div className="flex flex-wrap items-center justify-center gap-2 text-center">
          <span className="rounded-full bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent">
            You scored {state.score}/{state.total} today
          </span>
          {state.currentStreak > 0 && (
            <span className="rounded-full bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent">
              {state.currentStreak}-day streak
            </span>
          )}
          {state.communityStats && state.communityStats.players > 0 && (
            <span className="rounded-full border border-border px-3 py-1.5 text-xs text-muted">
              Average score today: {state.communityStats.averageScore.toFixed(1)}/{state.total} across{" "}
              {state.communityStats.players.toLocaleString()} players
            </span>
          )}
        </div>
      )}

      <div className="space-y-4">
        {state.questions.map((q, qi) => {
          const yourAnswer = state.playedToday ? state.yourAnswers?.[qi] : picks[qi];
          const correctIndex = state.playedToday ? state.correctIndices?.[qi] : null;
          return (
            <div key={qi} className="rounded-2xl border border-border bg-surface p-4">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted">{q.category}</p>
              <p className="mt-1 text-sm font-medium">{q.question}</p>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {q.options.map((opt, oi) => {
                  const isYourAnswer = yourAnswer === oi;
                  const isCorrect = state.playedToday && correctIndex === oi;
                  const isWrongPick = state.playedToday && isYourAnswer && correctIndex !== oi;
                  return (
                    <button
                      key={oi}
                      disabled={state.playedToday || submitting}
                      onClick={() => pick(qi, oi)}
                      className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                        isCorrect
                          ? "border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400"
                          : isWrongPick
                            ? "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-400"
                            : isYourAnswer
                              ? "border-accent bg-accent/10"
                              : "border-border hover:bg-background"
                      } ${state.playedToday ? "cursor-default" : "cursor-pointer"}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {!state.playedToday && (
        <button
          onClick={handleSubmit}
          disabled={!allPicked || submitting}
          className="w-full rounded-full bg-accent py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-85 disabled:opacity-40"
        >
          {submitting ? "Submitting..." : allPicked ? "Submit answers" : "Answer every question to submit"}
        </button>
      )}

      {state.playedToday && (
        <p className="text-center text-xs text-muted">
          {state.longestStreak > 0 && `Longest streak: ${state.longestStreak} days. `}
          Come back tomorrow for a new quiz.
        </p>
      )}
    </div>
  );
}
