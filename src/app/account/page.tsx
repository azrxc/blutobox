import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { INACTIVITY_DAYS } from "@/lib/cleanup";
import { totalStorageBytesFor } from "@/lib/limits";
import { ChangePasswordForm } from "./change-password-form";
import { FileList, type AccountFile } from "./file-list";

function formatGB(bytes: number) {
  return (bytes / (1024 * 1024 * 1024)).toFixed(2);
}

function buildAccountFiles(
  files: {
    id: string;
    filename: string;
    sizeBytes: bigint;
    downloadCount: number;
    createdAt: Date;
    lastAccessedAt: Date;
    shareLinks: { slug: string }[];
  }[],
  isPro: boolean
): AccountFile[] {
  const now = Date.now();
  return files.map((f) => {
    const deleteAt = new Date(f.lastAccessedAt.getTime() + INACTIVITY_DAYS * 24 * 60 * 60 * 1000);
    const daysLeft = Math.ceil((deleteAt.getTime() - now) / (24 * 60 * 60 * 1000));
    return {
      id: f.id,
      filename: f.filename,
      sizeBytes: f.sizeBytes.toString(),
      downloadCount: f.downloadCount,
      createdAt: f.createdAt.toISOString(),
      daysUntilDeletion: isPro ? null : daysLeft,
      slug: f.shareLinks[0]?.slug ?? null,
    };
  });
}

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [user, files] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.file.findMany({
      where: { ownerId: session.user.id, status: "ACTIVE" },
      include: { shareLinks: { take: 1 } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!user) redirect("/login");

  const isPro = user.planTier === "PRO";
  const totalBytes = totalStorageBytesFor(user.planTier);
  const usedBytes = Number(user.storageUsedBytes);
  const usedFraction = Math.min(1, usedBytes / totalBytes);

  const accountFiles = buildAccountFiles(files, isPro);

  return (
    <main className="flex flex-1 flex-col items-center gap-6 p-6">
      <div className="w-full max-w-2xl space-y-8">
        <div>
          <h1 className="text-xl font-semibold">Account</h1>
          <p className="text-sm text-neutral-500">
            {user.email} · {user.planTier} plan ·{" "}
            <Link href="/pricing" className="underline">
              {isPro ? "Manage subscription" : "Upgrade to Pro"}
            </Link>
          </p>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-medium">Storage</span>
            <span className="text-neutral-500">
              {formatGB(usedBytes)} GB of {formatGB(totalBytes)} GB used
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded bg-neutral-200 dark:bg-neutral-800">
            <div
              className={`h-full ${usedFraction > 0.9 ? "bg-red-500" : "bg-black dark:bg-white"}`}
              style={{ width: `${usedFraction * 100}%` }}
            />
          </div>
        </div>

        <div>
          <h2 className="mb-2 text-sm font-semibold">Your uploads ({accountFiles.length})</h2>
          <FileList files={accountFiles} />
        </div>

        <div className="border-t pt-6">
          <ChangePasswordForm />
        </div>
      </div>
    </main>
  );
}
