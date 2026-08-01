export type ChangelogEntry = {
  date: string;
  title: string;
  intro?: string;
  highlights?: string[];
};

export const changelog: ChangelogEntry[] = [
  {
    date: "2026-08-02",
    title: "Locking the doors properly",
    intro:
      "Mostly under-the-hood work today, but some of it matters a lot: I found (and fixed) a bug where every verification email pointed to a dead page, meaning no one who signed up could ever actually log in. Sorry about that.",
    highlights: [
      "Password reset — you can finally recover a forgotten password",
      "Fixed the dead verification-email link, plus a way to resend it if you got stuck before",
      "Login and signup are now rate-limited against brute-force/spam attempts",
      "Sharing a link on Discord/Twitter/Slack now shows an actual preview card instead of a bare URL",
      "New admin dashboard for cancellation feedback",
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
