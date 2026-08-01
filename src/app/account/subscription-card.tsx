"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export type SubscriptionInfo = {
  status: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
  daysLeft: number | null;
};

export function SubscriptionCard({ subscription }: { subscription: SubscriptionInfo | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  async function act(action: "cancel" | "resume") {
    if (action === "cancel") {
      const confirmed = confirm(
        `Cancel your Pro subscription? You'll keep Pro access until${dateStr ? ` ${dateStr}` : " the end of your current billing period"}, then it won't renew.`
      );
      if (!confirmed) return;
    }
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/stripe/${action}`, { method: "POST" });
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
            onClick={() => act("resume")}
            disabled={loading}
            className="shrink-0 rounded-full border border-border px-4 py-2 text-xs font-medium transition-colors hover:bg-background disabled:opacity-50"
          >
            {loading ? "…" : "Resume"}
          </button>
        ) : (
          <button
            onClick={() => act("cancel")}
            disabled={loading}
            className="shrink-0 rounded-full border border-border px-4 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-500/10 disabled:opacity-50 dark:text-red-400"
          >
            {loading ? "…" : "Cancel subscription"}
          </button>
        )}
      </div>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  );
}
