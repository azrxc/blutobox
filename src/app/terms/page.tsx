export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl flex-1 space-y-6 p-6 text-sm leading-relaxed">
      <div className="rounded border border-yellow-400 bg-yellow-50 p-3 text-xs text-yellow-800 dark:bg-yellow-950/20 dark:text-yellow-200">
        Template — replace placeholder details below and have this reviewed by a lawyer before public launch.
      </div>

      <h1 className="text-2xl font-semibold">Terms of Service</h1>
      <p className="text-neutral-500">Last updated: [DATE]</p>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">1. What this service is</h2>
        <p>
          Bluto Box (&quot;we&quot;, &quot;us&quot;) provides file storage and sharing tools. By using
          this service you agree to these terms.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">2. Prohibited content and use</h2>
        <p>You may not upload, share, or link to:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Content that infringes someone else&apos;s copyright or other intellectual property rights</li>
          <li>Child sexual abuse material (CSAM) — zero tolerance, reported to NCMEC/law enforcement immediately</li>
          <li>Content that is illegal in the jurisdiction where it is uploaded or accessed</li>
          <li>Malware or content intended to harm systems or users</li>
        </ul>
        <p>
          Content flagged as NSFW/adult must be accurately labeled as such at upload time.
          Users must be 18 or older to view NSFW-flagged content.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">3. Copyright / DMCA policy</h2>
        <p>
          If you believe content hosted on this service infringes your copyright, use the &quot;Report&quot; button
          on the file&apos;s page, or contact our designated agent at{" "}
          <a href="mailto:legal@blutobox.com" className="underline">legal@blutobox.com</a>. Include: (1) a description
          of the copyrighted work, (2) the URL of the infringing file, (3) your contact information, and (4) a statement
          that you have a good-faith belief the use is unauthorized.
        </p>
        <p>
          We remove content upon valid notice and terminate accounts of repeat infringers.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">4. Account termination</h2>
        <p>
          We may suspend or terminate accounts, or block network access, for violations of these terms, including
          repeated copyright reports or uploads of illegal content.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">5. Disclaimer and limitation of liability</h2>
        <p>
          The service is provided &quot;as is&quot; without warranties of any kind. We are not liable for content
          uploaded by users. To the maximum extent permitted by law, our liability is limited to the amount you paid
          us in the past 12 months.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">6. Contact</h2>
        <p>
          Questions about these terms: <a href="mailto:legal@blutobox.com" className="underline">legal@blutobox.com</a>
        </p>
      </section>
    </main>
  );
}
