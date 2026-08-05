export type ChangelogEntry = {
  date: string;
  title: string;
  intro?: string;
  highlights?: string[];
};

export const changelog: ChangelogEntry[] = [
  {
    date: "2026-08-06",
    title: "Clearer wording for sensitive content",
    intro: "Small but overdue wording pass on how sensitive content is presented, plus a couple of small account-page additions.",
    highlights: [
      "Sensitive-content warnings now read as a plain content notice ('flagged as sensitive content by the person who shared it') instead of an age-check prompt, since that category always covered more than just adult content, things like graphic imagery too",
      "Your account page now shows each file's link expiry date, not just the inactivity auto-delete countdown",
      "New About page (linked at the bottom of every page) with what Bluto Box is and how to reach us",
      "The report button on file pages now just says 'Report' instead of spelling out DMCA/abuse",
    ],
  },
  {
    date: "2026-08-05",
    title: "Bluto Box has a real home now",
    intro: "The big one: Bluto Box is live at its own domain instead of a Vercel subdomain. A few things behind the scenes got more reliable along the way too.",
    highlights: [
      "Bluto Box is now live at blutobox.com",
      "Improved email reliability: verification, password reset, and notification emails now go out through a proper email service instead of a consumer email account, so they're less likely to get lost along the way",
      "Free accounts can now add 1 creator link (Discord, socials, etc.) to their file pages. Pro accounts still get up to 5",
    ],
  },
  {
    date: "2026-08-02",
    title: "Locking the doors properly",
    intro:
      "Mostly under-the-hood work today, but some of it matters a lot: I found (and fixed) a bug where every verification email pointed to a dead page, meaning no one who signed up could ever actually log in. Sorry about that.",
    highlights: [
      "Password reset: you can finally recover a forgotten password",
      "Fixed the dead verification-email link, plus a way to resend it if you got stuck before",
      "Login and signup are now rate-limited against brute-force/spam attempts",
      "Sharing a link on Discord/Twitter/Slack now shows an actual preview card instead of a bare URL",
      "New admin dashboard for cancellation feedback",
      "New loading animation featuring Bluto (our three-headed mascot) instead of a generic spinner",
      "Cancel an in-progress download anytime. You're only charged download quota for what actually transferred, not the full file size if you cancel early",
      "QR codes on file pages can now be downloaded as an image, not just viewed",
      "Anonymous uploads (no account) now stay up for 7 days instead of sharing the same 30-day window as free accounts. Create a free account if you want things to stick around longer",
      "Pricing page now shows anonymous usage limits alongside Free and Pro so it's clear what each option gets you",
      "Softened the wording around mature-content warnings so they read as a clear age restriction rather than an attention-grabbing label, moved the sensitive-content question to a quick Yes/No step after you hit Upload instead of a checkbox sitting on the page by default, and made clear that misrepresenting it can lead to content removal or an account suspension",
      "New referral program: find your link on your account page, share it, and both you and whoever signs up get +1GB of storage once they verify their email (stacks up to +10GB)",
      "New free file converter tool: convert images between PNG/JPG/WebP, combine images into a PDF, split a PDF into images, merge multiple PDFs, split a PDF into individual pages, and convert Word (.docx) files to PDF, all done in your browser with nothing uploaded anywhere",
      "New 'Email this link' option on the upload-success and file pages: send a download link straight to someone's inbox instead of having to copy/paste it yourself",
    ],
  },
  {
    date: "2026-08-01",
    title: "Bluto Box launches",
    intro:
      "Upload, share, and download files with no account required. Free and Pro plans available, and a full day of polish on top of the core idea:",
    highlights: [
      "Password-protected & expiring share links for Pro",
      "Malware scanning on every upload (VirusTotal)",
      "Live download progress instead of a silent handoff to your browser",
      "Storage usage indicator on the upload/download pages, not just buried in Account",
      "Multi-file uploads (bundled into one .zip, one link) and QR codes for any share link",
      "Free accounts can now set a basic 24h/7-day link expiry too",
    ],
  },
];
