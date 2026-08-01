export type ChangelogEntry = {
  date: string;
  title: string;
  description: string;
};

export const changelog: ChangelogEntry[] = [
  {
    date: "2026-08-01",
    title: "Multi-file uploads, QR codes, and free link expiry",
    description:
      "Select multiple files to bundle them into one link, generate a QR code for any share link, and Free accounts can now set a 24h or 7-day link expiry (Pro still gets any custom duration).",
  },
  {
    date: "2026-08-01",
    title: "Storage usage indicator",
    description:
      "Your storage usage now shows up right on the upload and download pages, not just buried in Account.",
  },
  {
    date: "2026-08-01",
    title: "Malware scanning on upload",
    description:
      "Every upload is now checked against VirusTotal's malware database before a share link is created.",
  },
  {
    date: "2026-08-01",
    title: "Live download progress",
    description:
      "Downloads now show a real progress bar instead of just handing off to your browser silently.",
  },
  {
    date: "2026-08-01",
    title: "Pro: password-protected & expiring links",
    description:
      "Pro subscribers can now lock a share link with a password or set it to expire automatically.",
  },
  {
    date: "2026-08-01",
    title: "Bluto Box launches",
    description:
      "Upload, share, and download files with no account required. Free and Pro plans available.",
  },
];
