import type { Metadata } from "next";
import { ComparisonPage } from "../compare/comparison-page";

export const metadata: Metadata = {
  title: "Buzzheavier Alternative | Bluto Box",
  description:
    "Looking for a Buzzheavier alternative? Bluto Box has no ads around your downloads, and a file doesn't need 30 downloads in 60 days just to stay online.",
};

export default function BuzzheavierAlternativePage() {
  return (
    <ComparisonPage
      competitorName="Buzzheavier"
      rows={[
        { label: "Ad-free downloads", blutobox: true, competitor: false },
        { label: "Keeps a file online (free)", blutobox: "1 visit / 30 days", competitor: "30 downloads / 60 days" },
        { label: "Max file size (free)", blutobox: "2 GB", competitor: "No stated limit" },
        { label: "Files never deleted", blutobox: "On Pro", competitor: "Not offered" },
      ]}
      whySwitch={[
        {
          title: "No ads to click through",
          body: "Buzzheavier's free service runs on ad revenue shown around downloads. Bluto Box doesn't show ads anywhere, on Free or Pro.",
        },
        {
          title: "Your file doesn't need to go viral to survive",
          body: "Buzzheavier only keeps a file long-term once it's been downloaded 30 times within 60 days. On Bluto Box, one visit every 30 days keeps a Free file alive, and Pro files are never auto-deleted no matter how many people download them.",
        },
        {
          title: "Numbers instead of \"no limit\"",
          body: "\"No size limit\" sounds great until real-world speed and reliability depend on server load. Bluto Box states exact numbers up front so you know what you're actually getting.",
        },
      ]}
      sourceNote="Based on Buzzheavier's publicly documented free-tier behavior as of September 2026. Limits change over time on any service, so it's worth checking the provider's own site for the current details."
    />
  );
}
