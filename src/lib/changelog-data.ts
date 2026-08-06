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
    intro: "Small stuff today, but stuff I'd been meaning to get right for a while:",
    highlights: [
      "Sensitive-content warnings now read as a plain notice instead of an age-check prompt",
      "Your account page now shows each file's link expiry date, not just the inactivity auto-delete countdown",
      "New About page (linked at the bottom of every page)",
      "Simplified the report button on file pages",
      "New tool in the File converter: compute a file's SHA-256/SHA-1/SHA-512 hash right in your browser, with an optional compare-against field to check it matches what you expected",
      "You can now save files other people shared with you to your own account (look for the star on any file page). Free accounts can save up to 10, Pro is unlimited",
      "Creator links now show right under the filename instead of near the bottom, easier to notice",
      "The 'Email this link' button is now a compact icon, matching the other share buttons",
      "Fixed a layout bug where opening the Email button pushed the save/bookmark icon onto its own line",
      "Three new tools in the File converter: image compressor, video-to-GIF converter, and a duplicate-file finder",
      "New standalone Text diff tool: paste two blocks of text and see exactly what changed",
      "You can now upload directly from the homepage instead of having to click through to a separate page first",
      "New upload option: get an email the first time someone downloads your file",
      "New Pro upload option: limit a link to a set number of total downloads, then it stops working",
      "New Pro upload option: pick your own custom link name instead of a random one",
      "Dedicated pages for popular conversions (PNG to WebP, merge PDF, video to GIF, and more), linked from the File converter",
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
    intro: "A big batch today, a mix of fixes and new stuff. Highlights:",
    highlights: [
      "Password reset: you can finally recover a forgotten password",
      "Fixed an issue with email verification links, and added a way to resend a verification email if you need one",
      "Login and signup are now rate-limited against brute-force/spam attempts",
      "Sharing a link on Discord/Twitter/Slack now shows an actual preview card instead of a bare URL",
      "New admin dashboard for cancellation feedback",
      "New loading animation featuring Bluto (our three-headed mascot) instead of a generic spinner",
      "Cancel an in-progress download anytime. You're only charged download quota for what actually transferred, not the full file size if you cancel early",
      "QR codes on file pages can now be downloaded as an image, not just viewed",
      "Anonymous uploads (no account) now stay up for 7 days instead of sharing the same 30-day window as free accounts. Create a free account if you want things to stick around longer",
      "Pricing page now shows anonymous usage limits alongside Free and Pro so it's clear what each option gets you",
      "Simplified how you flag sensitive content when uploading: a quick Yes/No step after you hit Upload instead of a checkbox on the page",
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
