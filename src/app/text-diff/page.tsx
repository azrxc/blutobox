import type { Metadata } from "next";
import { TextDiffTool } from "./lazy-text-diff-tool";
import { ToolStructuredData } from "../structured-data";

export const metadata: Metadata = {
  title: "Free Text Diff / Compare Tool | Bluto Box",
  description: "Compare two blocks of text and see exactly what changed, free, right in your browser.",
};

export default function TextDiffPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <ToolStructuredData
        name="Bluto Box Text Diff / Compare Tool"
        description="Compare two blocks of text and see exactly what changed, free, right in your browser."
        path="/text-diff"
      />
      <TextDiffTool />
    </main>
  );
}
