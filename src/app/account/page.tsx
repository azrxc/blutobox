import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FREE_INACTIVITY_DAYS } from "@/lib/cleanup";
import { totalStorageBytesFor, maxCreatorLinksFor, MAX_REFERRAL_BONUS_BYTES } from "@/lib/limits";
import { ReferralCard } from "./referral-card";
import { ChangePasswordForm } from "./change-password-form";
import { UpdateNameForm } from "./update-name-form";
import { CreatorLinksForm } from "./creator-links-form";
import { LogoutButton } from "../logout-button";
import { FileList, type AccountFile } from "./file-list";
import { SubscriptionCard, type SubscriptionInfo } from "./subscription-card";
import { DownloadUsageBar } from "../download-usage-bar";
import { UsageBar } from "../usage-bar";
import { AccountTabs } from "./account-tabs";

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
    shareLinks: { slug: string; expiresAt: Date | null }[];
  }[],
  isPro: boolean
): AccountFile[] {
  const now = Date.now();
  return files.map((f) => {
    const deleteAt = new Date(f.lastAccessedAt.getTime() + FREE_INACTIVITY_DAYS * 24 * 60 * 60 * 1000);
    const daysLeft = Math.ceil((deleteAt.getTime() - now) / (24 * 60 * 60 * 1000));
    return {
      id: f.id,
      filename: f.filename,
      sizeBytes: f.sizeBytes.toString(),
      downloadCount: f.downloadCount,
      createdAt: f.createdAt.toISOString(),
      daysUntilDeletion: isPro ? null : daysLeft,
      linkExpiresAt: f.shareLinks[0]?.expiresAt?.toISOString() ?? null,
      slug: f.shareLinks[0]?.slug ?? null,
    };
  });
}

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [user, files, subscription, creatorLinks] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.file.findMany({
      where: { ownerId: session.user.id, status: "ACTIVE" },
      include: { shareLinks: { take: 1 } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.subscription.findUnique({ where: { userId: session.user.id } }),
    prisma.creatorLink.findMany({ where: { userId: session.user.id }, orderBy: { order: "asc" } }),
  ]);

  if (!user) redirect("/login");

  const isPro = user.planTier === "PRO";
  const totalBytes = totalStorageBytesFor(user.planTier, user.bonusStorageBytes);
  const usedBytes = Number(user.storageUsedBytes);

  const accountFiles = buildAccountFiles(files, isPro);

  const subscriptionInfo = buildSubscriptionInfo(isPro, subscription);

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-16">
      <div className="w-full max-w-2xl space-y-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {user.name ? `Hi, ${user.name}` : "Account"}
            </h1>
            <p className="mt-1 text-sm text-muted">
              {user.email} · {user.planTier} plan
            </p>
          </div>
          <div className="shrink-0 pt-1 text-sm">
            <LogoutButton />
          </div>
        </div>

        <AccountTabs
          overview={
            <div className="space-y-10">
              <SubscriptionCard subscription={subscriptionInfo} />
              <div>
                <h2 className="mb-3 text-sm font-semibold">Usage</h2>
                <div className="space-y-4">
                  <UsageBar label="Storage used" usedBytes={usedBytes} totalBytes={totalBytes} />
                  <DownloadUsageBar />
                </div>
              </div>
              <ReferralCard
                url={`${process.env.NEXTAUTH_URL}/register?ref=${user.id}`}
                bonusGb={Number(user.bonusStorageBytes) / (1024 * 1024 * 1024)}
                maxBonusGb={MAX_REFERRAL_BONUS_BYTES / (1024 * 1024 * 1024)}
              />
            </div>
          }
          files={
            <div>
              <h2 className="mb-3 text-sm font-semibold">Your uploads ({accountFiles.length})</h2>
              <div className="rounded-2xl border border-border bg-surface px-5">
                <FileList files={accountFiles} />
              </div>
            </div>
          }
          profile={
            <div className="space-y-10">
              <UpdateNameForm currentName={user.name} />
              <ChangePasswordForm hasPassword={Boolean(user.passwordHash)} />
            </div>
          }
          creator={
            <CreatorLinksForm
              initialLinks={creatorLinks.map((l) => ({ label: l.label, url: l.url }))}
              maxLinks={maxCreatorLinksFor(user.planTier)}
            />
          }
        />
      </div>
    </main>
  );
}
