import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { totalStorageBytesFor } from "@/lib/limits";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    usedBytes: Number(user.storageUsedBytes),
    totalBytes: totalStorageBytesFor(user.planTier, user.bonusStorageBytes),
    planTier: user.planTier,
  });
}
