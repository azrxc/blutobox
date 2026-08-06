import type { Metadata } from "next";
import Link from "next/link";
import { FileConverterTool } from "./file-converter-tool";

export const metadata: Metadata = {
  title: "Free File Converter | Bluto Box",
  description:
    "Convert images between PNG/JPG/WebP, combine images into a PDF, or split a PDF into images. Free, no sign-up, done entirely in your browser.",
};

const POPULAR_CONVERSIONS = [
  { href: "/file-converter/png-to-webp", label: "PNG to WebP" },
  { href: "/file-converter/jpg-to-png", label: "JPG to PNG" },
  { href: "/file-converter/compress-image", label: "Compress image" },
  { href: "/file-converter/merge-pdf", label: "Merge PDF" },
  { href: "/file-converter/pdf-to-jpg", label: "PDF to JPG" },
  { href: "/file-converter/word-to-pdf", label: "Word to PDF" },
  { href: "/file-converter/video-to-gif", label: "Video to GIF" },
];

export default function FileConverterPage() {
  return (
    <main className="flex flex-1 flex-col items-center gap-10 px-6 py-16">
      <FileConverterTool />
      <div className="w-full max-w-md">
        <p className="mb-2 text-xs font-medium text-muted">Popular conversions</p>
        <div className="flex flex-wrap gap-2 text-xs">
          {POPULAR_CONVERSIONS.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="rounded-full border border-border px-3 py-1.5 text-muted transition-colors hover:bg-surface hover:text-foreground"
            >
              {c.label}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
