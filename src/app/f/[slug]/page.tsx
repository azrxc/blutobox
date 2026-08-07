import { notFound } from "next/navigation";
import { cookies, headers } from "next/headers";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { FileViewer } from "./file-viewer";
import { ReportForm } from "./report-form";
import { PasswordGate } from "./password-gate";
import { CopyButton } from "./copy-button";
import { NsfwGate } from "./nsfw-gate";
import { DownloadButton } from "./download-button";
import { DownloadUsageBar } from "../../download-usage-bar";
import { QrCodeButton } from "../../lazy-qr-code-button";
import { EmailShareForm } from "../../email-share-form";
import { unlockCookieName, verifyUnlockToken } from "@/lib/link-lock";
import { isAgeVerificationRestrictedRegion } from "@/lib/region-block";
import { maxCreatorLinksFor } from "@/lib/limits";
import { auth } from "@/lib/auth";
import { BookmarkButton } from "./bookmark-button";
import { SocialShareButtons } from "../../social-share-buttons";

function formatBytes(bytes: bigint) {
  const n = Number(bytes);
  const units = ["B", "KB", "MB", "GB"];
  let value = n;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value.toFixed(1)} ${units[unit]}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const link = await prisma.shareLink.findUnique({ where: { slug }, include: { file: true } });

  // File pages are never searchable - a randomly-generated share link getting crawled
  // and indexed would expose files meant to be shared privately with specific people.
  const robots = { index: false, follow: false };

  if (!link || link.file.status !== "ACTIVE" || (link.expiresAt && link.expiresAt < new Date())) {
    return { title: "File not found | Bluto Box", robots };
  }

  if (link.passwordHash) {
    const title = "Password-protected file | Bluto Box";
    const description = "This file is protected. Enter the password to view it.";
    return {
      title,
      description,
      robots,
      openGraph: { title, description, siteName: "Bluto Box", images: ["/icon.png"] },
      twitter: { card: "summary", title, description, images: ["/icon.png"] },
    };
  }

  const { file } = link;
  const title = file.isNsfw ? "Sensitive file | Bluto Box" : file.filename;
  const description = file.isNsfw
    ? "This link was flagged as sensitive content by the person who shared it."
    : `${formatBytes(file.sizeBytes)} · Shared via Bluto Box`;

  return {
    title,
    description,
    robots,
    openGraph: { title, description, siteName: "Bluto Box", images: ["/icon.png"] },
    twitter: { card: "summary", title, description, images: ["/icon.png"] },
  };
}

export default async function FilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const link = await prisma.shareLink.findUnique({
    where: { slug },
    include: {
      file: { include: { owner: { include: { creatorLinks: { orderBy: { order: "asc" } } } } } },
    },
  });

  if (!link || link.file.status !== "ACTIVE") {
    notFound();
  }

  if (link.expiresAt && link.expiresAt < new Date()) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <p className="text-sm text-muted">This link has expired.</p>
      </main>
    );
  }

  if (link.file.maxDownloads !== null && link.file.downloadCount >= link.file.maxDownloads) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <p className="text-sm text-muted">This link has reached its download limit.</p>
      </main>
    );
  }

  if (link.passwordHash) {
    const cookieStore = await cookies();
    const token = cookieStore.get(unlockCookieName(slug))?.value;
    if (!verifyUnlockToken(slug, token)) {
      return <PasswordGate slug={slug} />;
    }
  }

  const { file } = link;

  const session = await auth();
  const isBookmarked = session?.user
    ? Boolean(
        await prisma.bookmark.findUnique({
          where: { userId_shareLinkId: { userId: session.user.id, shareLinkId: link.id } },
        })
      )
    : false;

  if (file.isNsfw) {
    const headersList = await headers();
    if (isAgeVerificationRestrictedRegion(headersList)) {
      return (
        <main className="flex flex-1 items-center justify-center px-6 py-16">
          <p className="max-w-sm text-center text-sm text-muted">
            This content isn&apos;t available in your region due to local age-verification requirements.
          </p>
        </main>
      );
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-16">
      <div className="w-full max-w-2xl space-y-6">
        <div>
          <h1 className="break-all text-lg font-semibold">{file.filename}</h1>
          <p className="mt-1 text-xs text-muted">
            {formatBytes(file.sizeBytes)} · {file.downloadCount} downloads
          </p>
          {file.owner && file.owner.creatorLinks.length > 0 && (
            <p className="mt-1 text-xs text-muted">
              From the creator:{" "}
              {file.owner.creatorLinks
                .slice(0, maxCreatorLinksFor(file.owner.planTier, file.owner.bonusCreatorLinks))
                .map((cl, i, arr) => (
                  <span key={cl.id}>
                    <a
                      href={cl.url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="text-foreground underline underline-offset-2 transition-colors hover:text-accent"
                    >
                      {cl.label}
                    </a>
                    {i < arr.length - 1 ? " · " : ""}
                  </span>
                ))}
            </p>
          )}
        </div>

        <NsfwGate isNsfw={file.isNsfw}>
          <div className="flex justify-center rounded-2xl border border-border bg-surface p-6">
            <FileViewer slug={slug} />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <DownloadButton slug={slug} filename={file.filename} sizeBytes={Number(file.sizeBytes)} />
            <CopyButton url={`${process.env.NEXTAUTH_URL}/f/${slug}`} />
            <QrCodeButton url={`${process.env.NEXTAUTH_URL}/f/${slug}`} />
            <SocialShareButtons url={`${process.env.NEXTAUTH_URL}/f/${slug}`} />
            {session?.user && <BookmarkButton slug={slug} initialBookmarked={isBookmarked} />}
            <EmailShareForm slug={slug} />
          </div>
        </NsfwGate>

        <div className="flex justify-end">
          <ReportForm slug={slug} />
        </div>

        <DownloadUsageBar />
      </div>
    </main>
  );
}
