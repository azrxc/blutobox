import { NextResponse } from "next/server";
import { deleteInactiveFreeFiles, warnUsersOfUpcomingDeletion } from "@/lib/cleanup";

export const maxDuration = 60;

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const warnResult = await warnUsersOfUpcomingDeletion();
  const deleteResult = await deleteInactiveFreeFiles();
  return NextResponse.json({ ok: true, ...warnResult, ...deleteResult });
}
