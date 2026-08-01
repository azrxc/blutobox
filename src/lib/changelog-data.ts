export type ChangelogEntry = {
  date: string;
  title: string;
  description: string;
};

export const changelog: ChangelogEntry[] = [
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
