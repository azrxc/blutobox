import type { Metadata } from "next";
import { ComparisonPage } from "../compare/comparison-page";

export const metadata: Metadata = {
  title: "WeTransfer Alternative - No Monthly Cap | Bluto Box",
  description:
    "Looking for a WeTransfer alternative? Bluto Box links don't expire in 3 days and there's no 10-transfers-per-month ceiling on the free plan.",
};

export default function WeTransferAlternativePage() {
  return (
    <ComparisonPage
      competitorName="WeTransfer"
      rows={[
        { label: "Free plan resets", blutobox: "Every day", competitor: "Every 30 days" },
        { label: "Free transfer cap", blutobox: "No monthly ceiling", competitor: "10 transfers / 30 days" },
        { label: "Link lifespan (free)", blutobox: "30 days inactive", competitor: "3 days" },
        { label: "Max file size (free)", blutobox: "2 GB", competitor: "3 GB per transfer" },
        { label: "Persistent account storage", blutobox: true, competitor: false },
      ]}
      whySwitch={[
        {
          title: "No monthly ceiling",
          body: "WeTransfer's free plan caps you at 10 transfers total in a rolling 30-day window. Bluto Box's quota resets every 24 hours, so one busy day doesn't burn through weeks of allowance.",
        },
        {
          title: "Links that don't vanish in 3 days",
          body: "WeTransfer free links expire 3 days after sending. Bluto Box keeps a Free-tier link alive for 30 days of inactivity, and Pro links never expire.",
        },
        {
          title: "Built to last, not just to send once",
          body: "WeTransfer is designed around a single send-and-forget transfer. Bluto Box gives every upload a lasting link plus an account to keep track of what you've shared.",
        },
      ]}
      sourceNote="Based on WeTransfer's publicly documented free-plan limits as of September 2026. Limits change over time on any service - check the provider's own site for current details."
    />
  );
}
