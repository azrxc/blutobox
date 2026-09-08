import type { Metadata } from "next";
import Link from "next/link";
import { AdventureTool } from "./lazy-adventure-tool";
import { ToolStructuredData } from "../structured-data";

export const metadata: Metadata = {
  title: "AI Text Adventure | Bluto Box",
  description: "A free AI-driven text adventure: type an action, the story continues. Family-friendly, no sign-up required.",
};

export default function AdventurePage() {
  return (
    <main className="flex flex-1 flex-col items-center px-6 py-16">
      <ToolStructuredData
        name="Bluto Box AI Text Adventure"
        description="A free AI-driven text adventure: type an action, the story continues. Family-friendly, no sign-up required."
        path="/adventure"
      />
      <div className="mb-6 w-full max-w-lg">
        <Link href="/ai" className="text-xs text-muted underline underline-offset-2 hover:text-foreground">
          ← Bluto Box AI
        </Link>
      </div>
      <AdventureTool />
    </main>
  );
}
