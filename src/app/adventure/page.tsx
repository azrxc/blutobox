import type { Metadata } from "next";
import { AdventureTool } from "./lazy-adventure-tool";
import { ToolStructuredData } from "../structured-data";

export const metadata: Metadata = {
  title: "AI Text Adventure | Bluto Box",
  description: "A free AI-driven text adventure: type an action, the story continues. Family-friendly, no sign-up required.",
};

export default function AdventurePage() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <ToolStructuredData
        name="Bluto Box AI Text Adventure"
        description="A free AI-driven text adventure: type an action, the story continues. Family-friendly, no sign-up required."
        path="/adventure"
      />
      <AdventureTool />
    </main>
  );
}
