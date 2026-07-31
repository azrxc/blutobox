import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { FileViewer } from "./file-viewer";
import { ReportForm } from "./report-form";
import { PasswordGate } from "./password-gate";
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
      <main className="flex flex-1 items-center justify-center p-6">
        <p className="text-sm text-neutral-500">This link has expired.</p>
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
    <main className="flex flex-1 flex-col items-center gap-4 p-6">
      <div className="w-full max-w-2xl space-y-4">
        <div>
          <h1 className="break-all text-lg font-semibold">{file.filename}</h1>
          <p className="text-xs text-neutral-500">
            {formatBytes(file.sizeBytes)} · {file.downloadCount} downloads
          </p>
        </div>

        <div className="flex justify-center rounded border p-4">
          <FileViewer slug={slug} isNsfw={file.isNsfw} />
        </div>

        <div className="flex items-center justify-between">
          <a
            href={`/api/files/${slug}/download`}
            className="rounded bg-black text-white px-4 py-2 text-sm"
          >
            Download
          </a>
          <ReportForm slug={slug} />
        </div>
      </div>
    </main>
  );
}
