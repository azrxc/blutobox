import type { Metadata } from "next";
import Link from "next/link";
import { DailyCharacterTool } from "./lazy-daily-character-tool";
import { ToolStructuredData } from "../../structured-data";

export const metadata: Metadata = {
  title: "Daily Character | Bluto Box AI",
  description: "A new AI-generated character every day. Build a streak, collect your favorites. Free, no sign-up required.",
};

export default function DailyCharacterPage() {
  return (
    <main className="flex flex-1 flex-col items-center px-6 py-16">
      <ToolStructuredData
        name="Bluto Box Daily Character"
        description="A new AI-generated character every day. Build a streak, collect your favorites."
        path="/ai/daily-character"
      />
      <div className="mb-6 w-full max-w-lg">
        <Link href="/ai" className="text-xs text-muted underline underline-offset-2 hover:text-foreground">
          ← Bluto Box AI
        </Link>
      </div>
      <DailyCharacterTool />
    </main>
  );
}
