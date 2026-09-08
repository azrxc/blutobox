import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Bluto Box AI | Bluto Box",
  description: "Free AI-powered experiences from Bluto Box - starting with an AI text adventure, more on the way.",
};

const EXPERIENCES = [
  {
    href: "/adventure",
    title: "AI Text Adventure",
    description:
      "An AI game master narrates a story, you type or choose what happens next, and a meter tracks how things are going. No two playthroughs are the same.",
    status: "live" as const,
  },
];

export default function AiHubPage() {
  return (
    <main className="flex flex-1 flex-col items-center px-6 py-16">
      <div className="w-full max-w-3xl space-y-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Bluto Box AI</h1>
          <p className="mt-2 text-sm text-muted">
            Free, no sign-up-required AI experiences, separate from Bluto Box&apos;s file hosting. Start with the
            text adventure below - more are on the way.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {EXPERIENCES.map((exp) => (
            <Link
              key={exp.href}
              href={exp.href}
              className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-5 transition-colors hover:bg-accent/5"
            >
              <h2 className="text-base font-semibold">{exp.title}</h2>
              <p className="text-sm text-muted">{exp.description}</p>
            </Link>
          ))}

          <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-border p-5 text-center">
            <p className="text-sm font-medium text-muted">More coming soon</p>
            <p className="text-xs text-muted">New AI experiences get added here over time.</p>
          </div>
        </div>

        <p className="text-xs text-muted">
          Looking for AI file summaries instead? Those live on individual file pages after you upload something,
          not here - see the{" "}
          <Link href="/faq" className="underline underline-offset-2">
            FAQ
          </Link>{" "}
          for details.
        </p>
      </div>
    </main>
  );
}
