import type { Metadata } from "next";
import { ComparisonPage } from "../compare/comparison-page";

export const metadata: Metadata = {
  title: "Mega Alternative - No Shared-IP Lockouts | Bluto Box",
  description:
    "Looking for a Mega.nz alternative? Bluto Box's daily download quota is tied to your own account, not your IP address, so it can't be used up by someone else on your network.",
};

export default function MegaAlternativePage() {
  return (
    <ComparisonPage
      competitorName="Mega"
      rows={[
        { label: "Free storage", blutobox: "5 GB", competitor: "20 GB" },
        { label: "Download quota tracked by", blutobox: "Your account", competitor: "Your IP address" },
        { label: "Quota window", blutobox: "24 hours, flat", competitor: "~6 hours, rolling" },
        { label: "Simple upload-and-share, no client needed", blutobox: true, competitor: true },
      ]}
      whySwitch={[
        {
          title: "No shared-IP lockouts",
          body: "Mega tracks free downloads by IP address, not account. On shared or public Wi-Fi, someone else's downloads can lock out yours for hours. Bluto Box's quota belongs to your own account.",
        },
        {
          title: "A plain daily reset, not a rolling window",
          body: "Mega's roughly 5 GB / 6-hour transfer quota is easy to use up with a single large download. Bluto Box gives 5 GB every day on a straightforward 24-hour clock.",
        },
        {
          title: "Just file sharing, not a full cloud suite",
          body: "Mega is built as an encrypted cloud drive first. If all you need is upload-a-file-get-a-link, Bluto Box does that one job without extra setup.",
        },
      ]}
      sourceNote="Based on Mega's publicly documented free-tier transfer-quota behavior as of September 2026. Limits change over time on any service - check the provider's own site for current details."
    />
  );
}
