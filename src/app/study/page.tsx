import type { Metadata } from "next";
import Link from "next/link";
import { StudyStudio } from "./study-studio";
import { Planner } from "./planner";

export const metadata: Metadata = {
  title: "Student workspace | Bluto Box",
  description: "Paraphrase, improve your writing, create revision notes, organize assignments and prepare files for submission.",
};
const tools = [
  ["/file-converter/merge-pdf", "Merge PDF", "Combine assignment documents."],
  ["/file-converter/word-to-pdf", "Word to PDF", "Prepare files for submission."],
  ["/file-converter", "Compress & convert", "Fit file submission limits."],
  ["/text-diff", "Compare text", "Review changes between drafts."],
  ["/upload", "Share files", "Send materials to your group."],
  ["/qr", "QR generator", "Create a QR for your presentation."],
];
export default function StudyPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted">Bluto Box / Study</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Study smarter. Write better.</h1>
        <p className="max-w-xl text-sm leading-relaxed text-muted sm:text-base">Your writing, revision, deadlines and assignment tools in one place.</p>
        <nav aria-label="Study sections" className="flex flex-wrap gap-2 text-sm">
          {[["#studio","AI studio"],["#planner","Assignments"],["#file-tools","File tools"]].map(([href,label]) => <a key={href} href={href} className="rounded-full border border-border bg-surface px-4 py-2 hover:bg-accent/5">{label}</a>)}
        </nav>
      </header>
      <section id="studio" className="scroll-mt-24"><StudyStudio /></section>
      <section id="planner" className="scroll-mt-24"><Planner /></section>
      <section id="file-tools" className="scroll-mt-24 space-y-4">
        <h2 className="text-xl font-semibold">Ready for submission?</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map(([href,name,description]) => <Link key={href} href={href} className="rounded-2xl border border-border bg-surface p-4 transition-colors hover:bg-accent/5"><h3 className="font-medium">{name} <span aria-hidden="true">↗</span></h3><p className="mt-1 text-sm text-muted">{description}</p></Link>)}
        </div>
      </section>
      <p className="text-xs text-muted">Keep your own voice, verify AI results, cite original sources and follow your university&apos;s academic integrity rules.</p>
    </main>
  );
}
