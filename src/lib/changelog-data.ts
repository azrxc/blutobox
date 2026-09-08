export type ChangelogEntry = {
  date: string;
  title: string;
  intro?: string;
  highlights?: string[];
};

export const changelog: ChangelogEntry[] = [
  {
    date: "2026-09-08",
    title: "New: Daily Trivia",
    intro: "A third Bluto Box AI experience:",
    highlights: [
      "New: Daily Trivia at /ai/trivia - 5 new AI-generated trivia questions every day, the same ones for everyone",
      "One attempt per day, build a streak by coming back, see how your score compares to everyone else who played today",
      "Free, no sign-up required",
    ],
  },
  {
    date: "2026-09-08",
    title: "Clearer upgrade paths and referral visibility",
    highlights: [
      "Hitting a file size or storage limit while uploading now shows an actual link to fix it (sign up if you're anonymous, upgrade to Pro if you're on Free), not just plain error text",
      "The pricing page now mentions the referral program for Free accounts wanting more storage without paying",
    ],
  },
  {
    date: "2026-09-08",
    title: "New: optional streak reminder emails for Daily Character",
    intro: "For people building a streak on Daily Character:",
    highlights: [
      "New: turn on an email reminder that only fires if you claimed yesterday but haven't claimed today yet, so your streak doesn't quietly reset",
      "Opt-in, off by default, and you can turn it off anytime from the Daily Character page",
    ],
  },
  {
    date: "2026-09-08",
    title: "New: comparison pages against other file hosts",
    intro: "Added a few honest, fact-checked comparisons for people evaluating alternatives:",
    highlights: [
      "New: /compare, plus dedicated pages against Gofile, WeTransfer, and Mega",
      "Each one lays out the real free-tier differences side by side - no exaggerated claims",
    ],
  },
  {
    date: "2026-09-08",
    title: "Daily Character now has real portraits, a guess game, and Q&A",
    intro: "A bigger update to Daily Character:",
    highlights: [
      "New: real AI-generated portrait art for today's character, not just a text description",
      "New: guess which of 3 traits actually belongs to today's character (2 are decoys) before they're revealed, and see how your guess compares to everyone else who played today",
      "New: ask today's character a few questions and get an in-character answer - 3/day if you're not logged in, 10/day on Free, 30/day on Pro",
    ],
  },
  {
    date: "2026-09-08",
    title: "Bluto Box AI is now its own section, plus Daily Character",
    intro: "AI experiences now have their own home, and a new daily habit to check out:",
    highlights: [
      "New: Bluto Box AI at /ai, a hub for free AI experiences separate from file hosting, with more planned over time",
      "New: Daily Character at /ai/daily-character, one new AI-generated character revealed each day, the same one for everyone",
      "Build a streak by claiming each day (resets if you miss a day), and save your favorites to a personal collection - 5 slots if you're not logged in, 20 on Free, 100 on Pro",
    ],
  },
  {
    date: "2026-09-08",
    title: "Adventures are now saved, not overwritten",
    intro: "Small but useful change to the AI text adventure:",
    highlights: [
      "Starting a new adventure no longer erases your old one - it's now a saved history you can reopen anytime",
      "Save up to 2 adventures at once if you're not logged in, 5 on Free, 15 on Pro (delete one to free up a slot)",
      "Each saved adventure shows its progress and whether it's still going, won, or ended",
    ],
  },
  {
    date: "2026-09-07",
    title: "AI text adventure",
    intro: "New free tool:",
    highlights: [
      "New: an AI-driven text adventure at /adventure, an AI game master narrates a story and continues it based on what you choose or type, no two playthroughs alike. Family-friendly by design",
      "Pick a preset scenario or write your own starting prompt",
      "Click a suggested action or type your own at each step",
      "A meter (Trust, Health, Sanity, Suspicion - whatever fits the story) tracks how things are going based on your choices; reaching one end wins the story, the other ends it",
      "Some moments are tense enough that only the suggested choices are available, no time to type something else",
      "One active adventure at a time. Logged-in accounts get it tied to their account and can pick up where they left off from any device; not logged in keeps it on that browser",
      "Daily turns (starting or continuing a story): 8/day if you're not logged in, 25/day on Free, 100/day on Pro",
    ],
  },
  {
    date: "2026-09-07",
    title: "New look, AI summaries, and a simpler upload flow",
    intro: "A bigger batch than usual:",
    highlights: [
      "New logo across the site and favicon",
      "New galaxy-style background for dark mode",
      "Simplified uploading: removed the 'flag as sensitive content' step, Bluto Box no longer asks uploaders to self-label content",
      "New: PDF and text-based file pages now have a 'Generate AI summary' button, get a quick AI-written summary of a file's contents without downloading it first. Uses: 1/day if you're not logged in, 3/day on Free, 15/day on Pro, resets daily. Not yet supported for APKs, ZIPs, images, video, audio, or other binary files, see the FAQ for why",
      "Migrated hosting to a new, isolated infrastructure account after the previous one got paused by another unrelated project sharing the same account",
    ],
  },
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
      "New one-click share buttons for WhatsApp and Telegram on file pages",
      "New daily upload limits for accounts (50/day Free, 200/day Pro) to keep the service healthy for everyone",
      "New Pro perk: customize QR codes with your own colors and a center logo",
      "New CLI tool for uploading from the command line, see the cli/ folder in the repo",
      "Every file converter tool now has an 'Upload & share this on Bluto Box' button after it finishes",
      "Video-to-GIF: Free can now convert up to 10s at 20fps, Pro up to 60s at 30fps",
      "Image compressor: Pro can now resize to an exact pixel dimension and compress up to 30 images at once (Free stays at 5)",
      "PDF merge: Pro can now add page numbers to the footer",
      "DOCX to PDF: Pro can now set a custom page margin",
      "New daily download-count limit for anonymous downloads (50/day per network) to match the upload-side limits",
      "Text diff tool: Pro can now export a comparison as an HTML file",
      "Referrals now also give both sides +1 creator link slot (on top of the existing +1GB storage), permanently, no subscription needed",
      "New FAQ page (linked at the bottom of every page)",
      "File pages are now blocked from search engine indexing, so a share link can't end up in Google results",
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
