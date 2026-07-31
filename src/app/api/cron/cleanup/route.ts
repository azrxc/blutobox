import { NextResponse } from "next/server";
import { deleteInactiveFreeFiles } from "@/lib/cleanup";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await deleteInactiveFreeFiles();
  return NextResponse.json({ ok: true, ...result });
}
