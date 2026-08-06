import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQ | Bluto Box",
  description: "Answers to common questions about file retention, limits, accounts, and how Bluto Box works.",
};

type QA = { q: string; a: React.ReactNode };

const faqs: QA[] = [
  {
    q: "How long will my files be stored?",
    a: (
      <>
        <p>
          Files are removed if they haven&apos;t been downloaded in a while. The exact window depends on how you
          uploaded:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>No account: 7 days since the last download</li>
          <li>Free account: 30 days since the last download</li>
          <li>Pro account: never auto-deleted</li>
        </ul>
        <p className="mt-2">
          Every download resets that timer back to the full window, so an actively-shared file can stay up
          indefinitely on the free tiers too, it just needs to actually get downloaded now and then.
        </p>
      </>
    ),
  },
  {
    q: "What's the difference between link expiry and file auto-deletion?",
    a: (
      <p>
        They&apos;re separate. Link expiry is a fixed deadline you choose at upload time (24h, 7 days, or any
        custom duration on Pro) - once it passes, the link stops working no matter how recently it was
        downloaded. Auto-deletion (above) is based on inactivity and only kicks in if a link has{" "}
        <em>no</em> expiry set. A link with no expiry and no downloads for the retention window will still get
        cleaned up.
      </p>
    ),
  },
  {
    q: "Will Pro improve my download speed?",
    a: (
      <p>
        Yes, actually. Free and anonymous downloads are throttled to about 8 MB/s to keep bandwidth costs
        predictable across everyone sharing that tier. Pro downloads aren&apos;t throttled at all.
      </p>
    ),
  },
  {
    q: "How do the daily upload and download limits work?",
    a: (
      <>
        <p>
          There are two separate kinds of limit: how much data you can move in a day, and how many separate
          files you can upload or download in a day. See the{" "}
          <Link href="/pricing" className="underline underline-offset-2">
            pricing page
          </Link>{" "}
          for the exact numbers per tier. Both reset on a rolling basis, not at a fixed clock time.
        </p>
      </>
    ),
  },
  {
    q: "Is there a limit on how many times one file can be downloaded?",
    a: (
      <p>
        Not by default. Pro accounts can optionally set a total-download cap on a specific link when
        uploading, once that many downloads happen the link stops working, regardless of the daily limits
        above.
      </p>
    ),
  },
  {
    q: "Can I customize my share link?",
    a: (
      <p>
        Pro accounts can pick a custom link name at upload time instead of the random one everyone else gets,
        for example <code className="rounded bg-surface px-1 py-0.5">blutobox.com/f/my-project-files</code>{" "}
        instead of a random string.
      </p>
    ),
  },
  {
    q: "Are my shared files searchable on Google?",
    a: <p>No. File pages are never indexed by search engines, regardless of plan.</p>,
  },
  {
    q: "What cookies does Bluto Box use?",
    a: (
      <p>
        A session cookie to keep you signed in, and a short-lived cookie to remember you&apos;ve unlocked a
        password-protected link. If you see ads on some pages, those come from Google AdSense, which sets its
        own cookies, see the{" "}
        <Link href="/privacy" className="underline underline-offset-2">
          Privacy Policy
        </Link>{" "}
        for details. Nothing else tracks you.
      </p>
    ),
  },
  {
    q: "I need help logging into my account.",
    a: (
      <p>
        If you&apos;ve lost your password, use the{" "}
        <Link href="/forgot-password" className="underline underline-offset-2">
          forgot password
        </Link>{" "}
        page, a reset link will be sent to your email. If you never verified your email after signing up, you
        won&apos;t be able to log in until you do, check your inbox (and spam folder) for the verification
        email.
      </p>
    ),
  },
  {
    q: "What happens if a file gets reported?",
    a: (
      <p>
        Every file page has a Report button for copyright and abuse complaints. Reports get reviewed, and
        valid copyright notices result in the file being removed. See the{" "}
        <Link href="/terms" className="underline underline-offset-2">
          Terms of Service
        </Link>{" "}
        for the full copyright and counter-notice process.
      </p>
    ),
  },
  {
    q: "Can I use Bluto Box from the command line?",
    a: (
      <p>
        Yes, there&apos;s a small CLI tool for anonymous uploads, same limits as uploading from a browser
        without an account. It&apos;s in the{" "}
        <a
          href="https://github.com/azrxc/blutobox/tree/main/cli"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2"
        >
          cli/ folder
        </a>{" "}
        of the repository.
      </p>
    ),
  },
  {
    q: "What happens if I run out of storage?",
    a: (
      <p>
        New uploads get blocked until you free up space by deleting something, or upgrade to Pro for a bigger
        total. Files you already have stay untouched either way.
      </p>
    ),
  },
];

export default function FaqPage() {
  return (
    <main className="flex flex-1 flex-col items-center px-6 py-16">
      <div className="w-full max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Frequently asked questions</h1>
          <p className="mt-2 text-sm text-muted">
            Didn&apos;t find what you&apos;re looking for?{" "}
            <a href="mailto:legal@blutobox.com" className="underline underline-offset-2">
              legal@blutobox.com
            </a>
            . Bluto Box is a solo-run project, so replies may take a bit, but they happen.
          </p>
        </div>

        <div className="divide-y divide-border rounded-2xl border border-border bg-surface">
          {faqs.map((item) => (
            <details key={item.q} className="group px-5 py-1">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-3.5 text-sm font-medium marker:content-none">
                <span>{item.q}</span>
                <span className="shrink-0 text-muted transition-transform group-open:rotate-180">⌄</span>
              </summary>
              <div className="pb-4 text-sm leading-relaxed text-muted">{item.a}</div>
            </details>
          ))}
        </div>
      </div>
    </main>
  );
}
