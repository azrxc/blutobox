export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl flex-1 space-y-6 px-6 py-16 text-sm leading-relaxed">
      <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3.5 text-xs text-yellow-800 dark:text-yellow-300">
        Template — replace placeholder details below and have this reviewed by a lawyer before public launch.
      </div>

      <h1 className="text-2xl font-semibold tracking-tight">Privacy Policy</h1>
      <p className="text-muted">Last updated: [DATE]</p>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">1. What we collect</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Account info: email address, hashed password</li>
          <li>Uploaded files and their metadata (filename, size, type)</li>
          <li>The IP address of uploaders, used for abuse prevention and rate limiting</li>
          <li>Payment information for Pro subscriptions, handled entirely by Stripe — we never see your card number</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">2. Why we collect it</h2>
        <p>
          Uploader IP addresses are retained to detect and block abuse (e.g. repeated copyright infringement or
          illegal content uploads) and are shared with law enforcement only when legally required or in response to a
          valid legal request.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">3. Third parties we use</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Backblaze B2 — file storage</li>
          <li>Neon — database hosting</li>
          <li>Stripe — payment processing</li>
          <li>Google (Gmail) — transactional email delivery</li>
          <li>Upstash — rate limiting infrastructure</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">4. Your rights</h2>
        <p>
          You can request deletion of your account and associated files at any time by contacting{" "}
          <a href="mailto:privacy@blutobox.com" className="underline">privacy@blutobox.com</a>.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">5. Contact</h2>
        <p>
          Questions about this policy: <a href="mailto:privacy@blutobox.com" className="underline">privacy@blutobox.com</a>
        </p>
      </section>
    </main>
  );
}
