import type { MetadataRoute } from "next";

// Only genuinely public, indexable, evergreen pages - deliberately excludes /f/[slug]
// (file pages already set noindex for privacy - see that page's own metadata), account
// pages, admin, and thin auth pages (login/register/etc.) that add no search value.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXTAUTH_URL ?? "https://blutobox.com";
  const now = new Date();

  const routes = [
    "",
    "/about",
    "/contact",
    "/pricing",
    "/faq",
    "/changelog",
    "/terms",
    "/privacy",
    "/upload",
    "/qr",
    "/text-diff",
    "/speed-test",
    "/ai",
    "/adventure",
    "/ai/daily-character",
    "/compare",
    "/gofile-alternative",
    "/wetransfer-alternative",
    "/mega-alternative",
    "/file-converter",
    "/file-converter/png-to-webp",
    "/file-converter/jpg-to-png",
    "/file-converter/compress-image",
    "/file-converter/merge-pdf",
    "/file-converter/pdf-to-jpg",
    "/file-converter/word-to-pdf",
    "/file-converter/video-to-gif",
  ];

  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority:
      route === ""
        ? 1
        : route.startsWith("/file-converter") ||
            route === "/qr" ||
            route === "/text-diff" ||
            route === "/speed-test" ||
            route === "/ai" ||
            route === "/adventure" ||
            route === "/ai/daily-character" ||
            route === "/compare" ||
            route === "/gofile-alternative" ||
            route === "/wetransfer-alternative" ||
            route === "/mega-alternative"
          ? 0.8
          : 0.5,
  }));
}
