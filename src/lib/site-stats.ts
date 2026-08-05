import { prisma } from "@/lib/prisma";
import { getSiteDownloadBytes } from "@/lib/download-quota";

function isoDay(date: Date) {
  return date.toISOString().slice(0, 10);
}

// Runs once a day from the cron job. Redis's site-wide download counter expires ~48h
// after creation, so this has to grab yesterday's number before it's gone for good.
export async function snapshotYesterdaySiteDownloadBytes() {
  const yesterday = isoDay(new Date(Date.now() - 24 * 60 * 60 * 1000));
  const bytes = await getSiteDownloadBytes(yesterday);
  await prisma.dailyStat.upsert({
    where: { date: yesterday },
    create: { date: yesterday, downloadBytes: BigInt(bytes) },
    update: { downloadBytes: BigInt(bytes) },
  });
}

export type DailyUsagePoint = { date: string; uploadBytes: number; downloadBytes: number };

// Upload bytes come straight from File.createdAt (permanent, no separate tracking
// needed). Download bytes come from the DailyStat snapshots, plus today's still-live
// Redis counter since today hasn't been snapshotted yet.
export async function getUsageSeries(days: number): Promise<DailyUsagePoint[]> {
  const cutoff = new Date(Date.now() - (days - 1) * 24 * 60 * 60 * 1000);
  const cutoffDay = isoDay(cutoff);
  const todayStr = isoDay(new Date());

  const [uploadRows, statRows, todayBytes] = await Promise.all([
    prisma.$queryRaw<{ date: string; bytes: bigint }[]>`
      SELECT to_char("createdAt", 'YYYY-MM-DD') as date, COALESCE(SUM("sizeBytes"), 0)::bigint as bytes
      FROM "File"
      WHERE "createdAt" >= ${cutoff}
      GROUP BY date
    `,
    prisma.dailyStat.findMany({ where: { date: { gte: cutoffDay } } }),
    getSiteDownloadBytes(todayStr),
  ]);

  const uploadByDate = new Map(uploadRows.map((r) => [r.date, Number(r.bytes)]));
  const downloadByDate = new Map(statRows.map((r) => [r.date, Number(r.downloadBytes)]));
  downloadByDate.set(todayStr, todayBytes);

  const points: DailyUsagePoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = isoDay(new Date(Date.now() - i * 24 * 60 * 60 * 1000));
    points.push({
      date: d,
      uploadBytes: uploadByDate.get(d) ?? 0,
      downloadBytes: downloadByDate.get(d) ?? 0,
    });
  }
  return points;
}
