// Discord has no public share-intent URL like these two, so it's left out here -
// the existing Copy/QR buttons already cover "paste this into Discord yourself."
export function SocialShareButtons({ url }: { url: string }) {
  const encodedUrl = encodeURIComponent(url);

  return (
    <>
      <a
        href={`https://wa.me/?text=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        title="Share on WhatsApp"
        aria-label="Share on WhatsApp"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-muted transition-colors hover:bg-background hover:text-foreground"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 21l1.65-4.95A8.5 8.5 0 1 1 8.9 19.4L3 21z" />
          <path d="M8.5 9.5c0 3.5 2.5 6 6 6" strokeLinecap="round" />
        </svg>
      </a>
      <a
        href={`https://t.me/share/url?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        title="Share on Telegram"
        aria-label="Share on Telegram"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-muted transition-colors hover:bg-background hover:text-foreground"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 2 11 13" />
          <path d="M22 2 15 22l-4-9-9-4 20-7z" />
        </svg>
      </a>
    </>
  );
}
