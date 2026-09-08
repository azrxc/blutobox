import type { Metadata } from "next";
import { ComparisonPage } from "../compare/comparison-page";

export const metadata: Metadata = {
  title: "Gofile Alternative | Bluto Box",
  description:
    "Looking for a Gofile alternative? Bluto Box works the same way, no account needed, but without ad-gated downloads or a hidden daily cap.",
};

export default function GofileAlternativePage() {
  return (
    <ComparisonPage
      competitorName="Gofile"
      rows={[
        { label: "Ad-free downloads", blutobox: true, competitor: false },
        { label: "Max file size (free)", blutobox: "2 GB", competitor: "No limit, but throttled" },
        { label: "Daily download cap (free)", blutobox: "5 GB/day, stated up front", competitor: "Capped, not published" },
        { label: "Inactive link lifespan (free)", blutobox: "30 days", competitor: "10 days" },
        { label: "Account required to upload", blutobox: false, competitor: false },
      ]}
      whySwitch={[
        {
          title: "No ad-gated downloads",
          body: "Gofile's free downloads run through ads and throttled speed before you get your file. Bluto Box never puts an ad between you and a download, on Free or Pro.",
        },
        {
          title: "Numbers you can plan around",
          body: "Gofile doesn't publish its free download cap, so you find out you've hit it when a download fails. Bluto Box states the exact number: 5 GB/day free, 25 GB/day Pro.",
        },
        {
          title: "Files last longer for free",
          body: "An inactive Gofile link can be gone in 10 days. Bluto Box keeps a Free-tier link alive for 30 days of inactivity, and Pro files are never auto-deleted.",
        },
      ]}
      sourceNote="Based on Gofile's publicly documented free-tier behavior as of September 2026. Limits change over time on any service, so it's worth checking the provider's own site for the current details."
    />
  );
}
