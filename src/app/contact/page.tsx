import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact | Bluto Box",
  description: "How to reach Bluto Box for support, feedback, copyright/abuse reports, or privacy questions.",
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-2xl flex-1 space-y-6 px-6 py-16 text-sm leading-relaxed">
      <h1 className="text-2xl font-semibold tracking-tight">Contact</h1>

      <section className="space-y-2">
        <p>
          Bluto Box is operated independently by Aoinyx - see the{" "}
          <Link href="/about" className="underline">
            About page
          </Link>{" "}
          for more on who runs it. It&apos;s a small, actively maintained project, so reaching out actually gets
          read.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">General questions, feedback, copyright/abuse reports</h2>
        <p>
          <a href="mailto:legal@blutobox.com" className="underline">
            legal@blutobox.com
          </a>
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Privacy questions</h2>
        <p>
          <a href="mailto:privacy@blutobox.com" className="underline">
            privacy@blutobox.com
          </a>
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Copyright takedown notices</h2>
        <p>
          Use the &quot;Report&quot; button on the file&apos;s page, or send a written notice to{" "}
          <a href="mailto:legal@blutobox.com" className="underline">
            legal@blutobox.com
          </a>
          . See the{" "}
          <Link href="/terms" className="underline">
            Terms of Service
          </Link>{" "}
          for what a valid notice must include.
        </p>
      </section>
    </main>
  );
}
