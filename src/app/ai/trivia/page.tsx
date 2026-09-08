import type { Metadata } from "next";
import Link from "next/link";
import { TriviaTool } from "./lazy-trivia-tool";
import { ToolStructuredData } from "../../structured-data";

export const metadata: Metadata = {
  title: "Daily Trivia | Bluto Box AI",
  description: "A new 5-question trivia quiz every day, the same one for everyone. Build a streak. Free, no sign-up required.",
};

export default function TriviaPage() {
  return (
    <main className="flex flex-1 flex-col items-center px-6 py-16">
      <ToolStructuredData
        name="Bluto Box Daily Trivia"
        description="A new 5-question trivia quiz every day, the same one for everyone. Build a streak."
        path="/ai/trivia"
      />
      <div className="mb-6 w-full max-w-lg">
        <Link href="/ai" className="text-xs text-muted underline underline-offset-2 hover:text-foreground">
          ← Bluto Box AI
        </Link>
      </div>
      <TriviaTool />
    </main>
  );
}
