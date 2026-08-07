import type { Metadata } from "next";
import { TextDiffTool } from "./lazy-text-diff-tool";

export const metadata: Metadata = {
  title: "Free Text Diff / Compare Tool | Bluto Box",
  description: "Compare two blocks of text and see exactly what changed, free, right in your browser.",
};

export default function TextDiffPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <TextDiffTool />
    </main>
  );
}
