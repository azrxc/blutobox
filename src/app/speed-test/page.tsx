import type { Metadata } from "next";
import { SpeedTestTool } from "./lazy-speed-test-tool";
import { ToolStructuredData } from "../structured-data";

export const metadata: Metadata = {
  title: "Download Speed Test | Bluto Box",
  description: "Test your real download speed from Bluto Box, free, no sign-up required.",
};

export default function SpeedTestPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <ToolStructuredData
        name="Bluto Box Speed Test"
        description="Test your real download speed from Bluto Box, free, no sign-up required."
        path="/speed-test"
      />
      <SpeedTestTool />
    </main>
  );
}
