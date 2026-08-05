import type { Metadata } from "next";
import { FileConverterTool } from "./file-converter-tool";

export const metadata: Metadata = {
  title: "Free File Converter — Bluto Box",
  description:
    "Convert images between PNG/JPG/WebP, combine images into a PDF, or split a PDF into images — free, no sign-up, done entirely in your browser.",
};

export default function FileConverterPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <FileConverterTool />
    </main>
  );
}
