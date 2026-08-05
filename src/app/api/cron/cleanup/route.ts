import { NextResponse } from "next/server";
import { deleteInactiveFreeFiles, warnUsersOfUpcomingDeletion } from "@/lib/cleanup";
import { snapshotYesterdaySiteDownloadBytes } from "@/lib/site-stats";

export const maxDuration = 60;

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const warnResult = await warnUsersOfUpcomingDeletion();
  const deleteResult = await deleteInactiveFreeFiles();
  await snapshotYesterdaySiteDownloadBytes().catch(() => {});
  return NextResponse.json({ ok: true, ...warnResult, ...deleteResult });
}
