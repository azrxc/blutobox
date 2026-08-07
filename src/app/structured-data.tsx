// JSON-LD for free browser tool pages - helps search engines understand these are free
// software utilities, not just generic content pages. No rating/review data included
// since fabricating that would violate Google's structured-data guidelines.
export function ToolStructuredData({ name, description, path }: { name: string; description: string; path: string }) {
  const base = process.env.NEXTAUTH_URL ?? "https://blutobox.com";
  const data = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    description,
    url: `${base}${path}`,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any (runs in your browser)",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
