"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FREE_TOTAL_STORAGE_BYTES,
  PRO_TOTAL_STORAGE_BYTES,
  FREE_DAILY_DOWNLOAD_BYTES,
  PRO_DAILY_DOWNLOAD_BYTES,
} from "@/lib/limits";

export type SubscriptionInfo = {
  status: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
  daysLeft: number | null;
};

const CANCEL_REASONS = [
  "Too expensive",
  "Not using it enough",
  "Missing a feature I need",
  "Found an alternative",
  "Technical issues",
  "Other",
];

function gb(bytes: number) {
  return Math.round(bytes / (1024 * 1024 * 1024));
}

const LOSSES = [
  `Storage drops from ${gb(PRO_TOTAL_STORAGE_BYTES)} GB to ${gb(FREE_TOTAL_STORAGE_BYTES)} GB`,
  `Daily download limit drops from ${gb(PRO_DAILY_DOWNLOAD_BYTES)} GB to ${gb(FREE_DAILY_DOWNLOAD_BYTES)} GB`,
  "Downloads get speed-capped instead of running at full speed",
  "You lose password-protected and expiring share links",
];

export function SubscriptionCard({ subscription }: { subscription: SubscriptionInfo | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCancelPanel, setShowCancelPanel] = useState(false);
  const [reason, setReason] = useState("");
  const [comment, setComment] = useState("");

  if (!subscription) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-5">
        <p className="text-sm text-muted">
          You&apos;re on the Free plan.{" "}
          <Link href="/pricing" className="text-foreground underline underline-offset-2">
            Upgrade to Pro
          </Link>
        </p>
      </div>
    );
  }

  const dateStr = subscription.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  async function confirmCancel() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/stripe/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: reason || undefined, comment: comment.trim() || undefined }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong");
      return;
    }
    setShowCancelPanel(false);
    router.refresh();
  }

  async function resume() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/stripe/resume", { method: "POST" });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong");
      return;
    }
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Pro plan</p>
          {subscription.cancelAtPeriodEnd ? (
            <p className="mt-0.5 text-sm text-muted">
              Cancels{dateStr ? ` on ${dateStr}` : ""}
              {subscription.daysLeft !== null && subscription.daysLeft >= 0
                ? ` (${subscription.daysLeft} day${subscription.daysLeft === 1 ? "" : "s"} left)`
                : ""}
              . You&apos;ll keep Pro until then.
            </p>
          ) : (
            <p className="mt-0.5 text-sm text-muted">
              Renews{dateStr ? ` on ${dateStr}` : ""}
              {subscription.daysLeft !== null && subscription.daysLeft >= 0
                ? ` (${subscription.daysLeft} day${subscription.daysLeft === 1 ? "" : "s"} left)`
                : ""}
              .
            </p>
          )}
        </div>
        {subscription.cancelAtPeriodEnd ? (
          <button
            onClick={resume}
            disabled={loading}
            className="shrink-0 rounded-full border border-border px-4 py-2 text-xs font-medium transition-colors hover:bg-background disabled:opacity-50"
          >
            {loading ? "…" : "Resume"}
          </button>
        ) : (
          !showCancelPanel && (
            <button
              onClick={() => setShowCancelPanel(true)}
              className="shrink-0 rounded-full border border-border px-4 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-500/10 dark:text-red-400"
            >
              Cancel subscription
            </button>
          )
        )}
      </div>

      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

      {showCancelPanel && (
        <div className="mt-4 space-y-4 border-t border-border pt-4">
          <div>
            <p className="text-xs font-medium">
              If you cancel, you&apos;ll keep Pro until{dateStr ? ` ${dateStr}` : " the end of your billing period"},
              then:
            </p>
            <ul className="mt-2 space-y-1 text-xs text-muted">
              {LOSSES.map((loss) => (
                <li key={loss} className="flex gap-1.5">
                  <span>·</span>
                  <span>{loss}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted" htmlFor="cancel-reason">
              Mind telling us why? (optional, helps us improve)
            </label>
            <select
              id="cancel-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs"
            >
              <option value="">Prefer not to say</option>
              {CANCEL_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Anything else? (optional)"
              rows={2}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={confirmCancel}
              disabled={loading}
              className="rounded-full bg-red-600 px-4 py-2 text-xs font-medium text-white transition-opacity hover:opacity-85 disabled:opacity-50"
            >
              {loading ? "…" : "Confirm cancellation"}
            </button>
            <button
              onClick={() => setShowCancelPanel(false)}
              disabled={loading}
              className="rounded-full border border-border px-4 py-2 text-xs font-medium transition-colors hover:bg-background disabled:opacity-50"
            >
              Never mind, keep Pro
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
