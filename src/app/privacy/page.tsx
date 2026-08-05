export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl flex-1 space-y-6 px-6 py-16 text-sm leading-relaxed">
      <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3.5 text-xs text-yellow-800 dark:text-yellow-300">
        Have this reviewed by a lawyer before treating it as final. This covers the real mechanics of the
        service but hasn&apos;t had professional legal review yet.
      </div>

      <h1 className="text-2xl font-semibold tracking-tight">Privacy Policy</h1>
      <p className="text-muted">Last updated: August 5, 2026</p>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">1. What we collect</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Account info: name, email address, hashed password (we never store your password in plain text)</li>
          <li>Uploaded files and their metadata (filename, size, type)</li>
          <li>The IP address of uploaders and downloaders, used for abuse prevention, rate limiting, and enforcing daily download limits</li>
          <li>Payment information for Pro subscriptions, handled entirely by Stripe. We never see or store your card number</li>
          <li>A session cookie to keep you signed in, and a short-lived cookie to remember that you&apos;ve unlocked a password-protected link</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">2. Why we collect it</h2>
        <p>
          Uploader and downloader IP addresses are retained to detect and block abuse (e.g. repeated copyright
          infringement, illegal content uploads, or attempts to bypass rate limits), and are shared with law
          enforcement only when legally required or in response to a valid legal request. When you upload a
          file, its content hash (not the file itself) is checked against VirusTotal&apos;s malware database
          before the file is made available. Account and file data is kept for as long as your account or file
          exists; if a file is auto-deleted for inactivity or you delete your account, its associated data is
          removed from our active systems, though backups may persist for a limited time before being purged.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">3. Cookies</h2>
        <p>
          We use a small number of strictly necessary cookies: to keep you signed in, and to remember that
          you&apos;ve entered the correct password for a protected link. We don&apos;t use advertising or
          tracking cookies, and we don&apos;t sell your data to anyone.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">4. Third parties we use</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Backblaze B2: file storage</li>
          <li>Neon: database hosting</li>
          <li>Vercel: application hosting</li>
          <li>Stripe: payment processing</li>
          <li>Resend: transactional email delivery (verification, password reset, notifications)</li>
          <li>Upstash: rate limiting infrastructure</li>
          <li>Cloudflare: DNS, domain, and email routing</li>
          <li>VirusTotal: malware hash-reputation checks on uploaded files (only a hash is sent, not the file)</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">5. Your rights</h2>
        <p>
          You can request access to, a copy of, or deletion of your account and associated files at any time by
          contacting <a href="mailto:privacy@blutobox.com" className="underline">privacy@blutobox.com</a>. If you
          are in the European Economic Area, the UK, or California, you may have additional rights under GDPR or
          CCPA/CPRA, including the right to correct inaccurate data and the right to object to certain processing.
          Contact us at the address above to exercise any of these rights.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">6. Children&apos;s privacy</h2>
        <p>
          This service is not directed at children under 13, and we do not knowingly collect personal
          information from children under 13. If you believe a child has provided us with personal information,
          contact us and we will delete it.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">7. Contact</h2>
        <p>
          Questions about this policy: <a href="mailto:privacy@blutobox.com" className="underline">privacy@blutobox.com</a>
        </p>
      </section>
    </main>
  );
}
