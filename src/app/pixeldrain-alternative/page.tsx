import type { Metadata } from "next";
import { ComparisonPage } from "../compare/comparison-page";

export const metadata: Metadata = {
  title: "Pixeldrain Alternative | Bluto Box",
  description:
    "Looking for a Pixeldrain alternative? Bluto Box's Pro plan costs less than half of Pixeldrain Pro, with a simple daily quota instead of a per-file bandwidth pool.",
};

export default function PixeldrainAlternativePage() {
  return (
    <ComparisonPage
      competitorName="Pixeldrain"
      rows={[
        { label: "Pro plan price", blutobox: "$4.99/mo", competitor: "$12/mo" },
        { label: "Free daily transfer", blutobox: "5 GB/day, flat per account", competitor: "~6 GB/day, per-file pool" },
        { label: "Max file size (free)", blutobox: "2 GB", competitor: "Up to 20 GB" },
        { label: "Inactive file lifespan (free)", blutobox: "30 days", competitor: "120 days" },
      ]}
      whySwitch={[
        {
          title: "A cheaper Pro plan",
          body: "Pixeldrain Pro runs $12 a month to remove its size and speed limits. Bluto Box Pro is $4.99 a month and already comes with 50 GB of storage, 10 GB files, and 25 GB of downloads a day.",
        },
        {
          title: "One quota, not a pool per file",
          body: "Pixeldrain's free bandwidth is tied to each individual file and throttles once it's used up. Bluto Box just gives your account a flat 5 GB a day, no per-file math to keep track of.",
        },
        {
          title: "Worth knowing either way",
          body: "If you mainly need to park one large file for months without anyone downloading it, Pixeldrain's free tier is actually roomier there. We'd rather tell you that than pretend otherwise.",
        },
      ]}
      sourceNote="Based on Pixeldrain's publicly documented free-tier and Pro pricing as of September 2026. Limits change over time on any service, so it's worth checking the provider's own site for the current details."
    />
  );
}
