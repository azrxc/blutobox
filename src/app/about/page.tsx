import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | Bluto Box",
  description: "What Bluto Box is and who runs it.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-2xl flex-1 space-y-6 px-6 py-16 text-sm leading-relaxed">
      <h1 className="text-2xl font-semibold tracking-tight">About Bluto Box</h1>

      <section className="space-y-2">
        <p>
          Bluto Box is a straightforward file upload and sharing service. Upload a file, get a link, share it.
          No account needed for a quick one-off share; a free account gets you more storage and a history of
          what you&apos;ve uploaded; Pro removes the storage ceiling and adds a few extras like custom link
          expiry and password-protected links.
        </p>
        <p>
          It was built to be a simple, reliable place to move files around without the bloat a lot of other
          services pile on top of that one basic job.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Who runs it</h2>
        <p>
          Bluto Box is operated independently by Aoinyx. It&apos;s a small, actively maintained project, not a
          large company, if something&apos;s broken or you have feedback, reaching out actually gets read.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Contact</h2>
        <p>
          General questions, feedback, or copyright/abuse reports:{" "}
          <a href="mailto:legal@blutobox.com" className="underline">legal@blutobox.com</a>
          <br />
          Privacy questions: <a href="mailto:privacy@blutobox.com" className="underline">privacy@blutobox.com</a>
        </p>
      </section>
    </main>
  );
}
