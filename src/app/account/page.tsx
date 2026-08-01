import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { INACTIVITY_DAYS } from "@/lib/cleanup";
import { totalStorageBytesFor } from "@/lib/limits";
import { ChangePasswordForm } from "./change-password-form";
import { UpdateNameForm } from "./update-name-form";
import { FileList, type AccountFile } from "./file-list";
import { SubscriptionCard, type SubscriptionInfo } from "./subscription-card";
import { DownloadUsageBar } from "../download-usage-bar";
import { UsageBar } from "../usage-bar";

function buildSubscriptionInfo(
  isPro: boolean,
  subscription: {
    status: string;
    cancelAtPeriodEnd: boolean;
    currentPeriodEnd: Date | null;
    billingInterval: string | null;
  } | null
): SubscriptionInfo | null {
  if (!isPro || !subscription) return null;
  const now = Date.now();
  return {
    status: subscription.status,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() ?? null,
    billingInterval: subscription.billingInterval,
    daysLeft: subscription.currentPeriodEnd
      ? Math.ceil((subscription.currentPeriodEnd.getTime() - now) / (24 * 60 * 60 * 1000))
      : null,
  };
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

  const [user, files, subscription] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.file.findMany({
      where: { ownerId: session.user.id, status: "ACTIVE" },
      include: { shareLinks: { take: 1 } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.subscription.findUnique({ where: { userId: session.user.id } }),
  ]);

  if (!user) redirect("/login");

  const isPro = user.planTier === "PRO";
  const totalBytes = totalStorageBytesFor(user.planTier);
  const usedBytes = Number(user.storageUsedBytes);

  const accountFiles = buildAccountFiles(files, isPro);

  const subscriptionInfo = buildSubscriptionInfo(isPro, subscription);

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-16">
      <div className="w-full max-w-2xl space-y-10">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {user.name ? `Hi, ${user.name}` : "Account"}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {user.email} · {user.planTier} plan
          </p>
        </div>

        <SubscriptionCard subscription={subscriptionInfo} />

        <div>
          <h2 className="mb-3 text-sm font-semibold">Usage</h2>
          <div className="space-y-4">
            <UsageBar label="Storage used" usedBytes={usedBytes} totalBytes={totalBytes} />
            <DownloadUsageBar />
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold">Your uploads ({accountFiles.length})</h2>
          <div className="rounded-2xl border border-border bg-surface px-5">
            <FileList files={accountFiles} />
          </div>
        </div>

        <div className="border-t border-border pt-8">
          <UpdateNameForm currentName={user.name} />
        </div>

        <ChangePasswordForm />
      </div>
    </main>
  );
}
