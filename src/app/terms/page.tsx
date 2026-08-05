export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl flex-1 space-y-6 px-6 py-16 text-sm leading-relaxed">
      <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3.5 text-xs text-yellow-800 dark:text-yellow-300">
        Have this reviewed by a lawyer before treating it as final. This covers the real mechanics of the
        service but hasn&apos;t had professional legal review yet.
      </div>

      <h1 className="text-2xl font-semibold tracking-tight">Terms of Service</h1>
      <p className="text-muted">Last updated: August 5, 2026</p>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">1. What this service is</h2>
        <p>
          Bluto Box (&quot;we&quot;, &quot;us&quot;) provides file storage and sharing tools, with a Free tier and
          a paid Pro tier. By using this service you agree to these terms. You must be at least 13 years old to
          use this service; if you are under 18, you must not view content flagged as sensitive/mature.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">2. Prohibited content and use</h2>
        <p>You may not upload, share, or link to:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Content that infringes someone else&apos;s copyright or other intellectual property rights</li>
          <li>Child sexual abuse material (CSAM): zero tolerance, reported to NCMEC/law enforcement immediately</li>
          <li>
            Real, graphic depictions of death, severe injury, or violence against people or animals (e.g. war
            casualties, executions, torture). This is prohibited outright, not an age-gated category
          </li>
          <li>Content that promotes or glorifies terrorism or acts of mass violence</li>
          <li>Non-consensual intimate imagery, or content that harasses, doxxes, or impersonates another person</li>
          <li>Content that is illegal in the jurisdiction where it is uploaded or accessed</li>
          <li>Malware, or content intended to harm systems or users</li>
          <li>Spam, or content whose primary purpose is phishing or fraud</li>
        </ul>
        <p>
          Content flagged as NSFW/adult (consensual, legal adult content) must be accurately labeled as such at
          upload time. Users must be 18 or older to view NSFW-flagged content. This is separate from the graphic
          violence prohibition above. Flagging adult content correctly does not make otherwise-prohibited content
          allowed. Misrepresenting content&apos;s classification may result in removal and account suspension.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">3. Free and Pro plans</h2>
        <p>
          The Free plan has no cost and is subject to storage, file size, and download limits described on our{" "}
          <a href="/pricing" className="underline">Pricing page</a>. The Pro plan is a paid subscription, billed
          monthly or yearly at the rate shown at checkout, processed by Stripe. Subscriptions renew automatically
          until cancelled. You can cancel anytime from your account page; you&apos;ll keep Pro access until the
          end of the current billing period, with no partial refund for unused time unless required by law.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">4. File retention and deletion</h2>
        <p>
          Files uploaded anonymously (no account) are automatically deleted after 7 days without a download.
          Files uploaded by a Free account are automatically deleted after 30 days without a download. Pro-owned
          files are not subject to automatic deletion. We may also remove any file at any time for violating
          these terms, or if legally required to do so.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">5. Copyright / DMCA policy</h2>
        <p>
          If you believe content hosted on this service infringes your copyright, use the &quot;Report&quot; button
          on the file&apos;s page, or send a written notice to our designated agent at{" "}
          <a href="mailto:legal@blutobox.com" className="underline">legal@blutobox.com</a>. To be a valid notice
          under the DMCA, it must include:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>A physical or electronic signature of the copyright owner or their authorized representative</li>
          <li>Identification of the copyrighted work claimed to have been infringed</li>
          <li>Identification of the material claimed to be infringing, and its location (URL) on this service</li>
          <li>Your contact information (address, phone number, email)</li>
          <li>A statement that you have a good-faith belief the use is not authorized by the copyright owner, its agent, or the law</li>
          <li>A statement, under penalty of perjury, that the information in the notice is accurate and that you are authorized to act on behalf of the copyright owner</li>
        </ul>
        <p>
          We remove content upon valid notice and terminate the accounts of repeat infringers. If your content was
          removed and you believe this was a mistake, you may submit a counter-notice to the same address,
          including your consent to the jurisdiction of the federal court in your district and a statement under
          penalty of perjury that the material was removed by mistake or misidentification.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">6. Account termination</h2>
        <p>
          We may suspend or terminate accounts, or block network access, for violations of these terms, including
          repeated copyright reports or uploads of illegal content. Files owned by a terminated account may be
          removed.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">7. Disclaimer and limitation of liability</h2>
        <p>
          The service is provided &quot;as is&quot; without warranties of any kind. We are not liable for content
          uploaded by users. To the maximum extent permitted by law, our liability is limited to the amount you paid
          us in the past 12 months.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">8. Changes to these terms</h2>
        <p>
          We may update these terms from time to time. Material changes will be reflected by an updated &quot;Last
          updated&quot; date above; continued use of the service after a change means you accept the updated terms.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">9. Governing law</h2>
        <p>
          These terms are governed by the laws of the United States, without regard to conflict-of-law
          principles. Any dispute arising from these terms or the service will be resolved in the courts with
          jurisdiction over the operator, and you consent to that jurisdiction.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">10. Contact</h2>
        <p>
          Questions about these terms: <a href="mailto:legal@blutobox.com" className="underline">legal@blutobox.com</a>
        </p>
      </section>
    </main>
  );
}
