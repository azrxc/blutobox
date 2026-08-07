import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXTAUTH_URL ?? "https://blutobox.com";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /f/[slug] pages already set noindex individually (privacy - see their own
      // metadata), account/admin pages require auth anyway. Disallow here too as a
      // second layer so crawlers don't waste budget requesting them at all.
      disallow: ["/f/", "/account", "/admin"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
