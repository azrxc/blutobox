import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { FileViewer } from "./file-viewer";
import { ReportForm } from "./report-form";
import { PasswordGate } from "./password-gate";
import { CopyButton } from "./copy-button";
import { NsfwGate } from "./nsfw-gate";
import { DownloadButton } from "./download-button";
import { unlockCookieName, verifyUnlockToken } from "@/lib/link-lock";

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

export default async function FilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const link = await prisma.shareLink.findUnique({
    where: { slug },
    include: { file: true },
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

  if (link.passwordHash) {
    const cookieStore = await cookies();
    const token = cookieStore.get(unlockCookieName(slug))?.value;
    if (!verifyUnlockToken(slug, token)) {
      return <PasswordGate slug={slug} />;
    }
  }

  const { file } = link;

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-16">
      <div className="w-full max-w-2xl space-y-6">
        <div>
          <h1 className="break-all text-lg font-semibold">{file.filename}</h1>
          <p className="mt-1 text-xs text-muted">
            {formatBytes(file.sizeBytes)} · {file.downloadCount} downloads
          </p>
        </div>

        <NsfwGate isNsfw={file.isNsfw}>
          <div className="flex justify-center rounded-2xl border border-border bg-surface p-6">
            <FileViewer slug={slug} />
          </div>

          <div className="mt-6 flex items-center gap-3">
            <DownloadButton slug={slug} filename={file.filename} sizeBytes={Number(file.sizeBytes)} />
            <CopyButton url={`${process.env.NEXTAUTH_URL}/f/${slug}`} />
          </div>
        </NsfwGate>

        <div className="flex justify-end">
          <ReportForm slug={slug} />
        </div>
      </div>
    </main>
  );
}
