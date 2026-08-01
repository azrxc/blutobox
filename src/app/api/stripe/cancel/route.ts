import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "You must be logged in" }, { status: 401 });
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });
  if (!subscription?.stripeSubscriptionId) {
    return NextResponse.json({ error: "No active subscription found" }, { status: 404 });
  }

  const updated = await getStripe().subscriptions.update(subscription.stripeSubscriptionId, {
    cancel_at_period_end: true,
  });

  const periodEndUnix = updated.items.data[0]?.current_period_end;
  await prisma.subscription.update({
    where: { userId: session.user.id },
    data: {
      cancelAtPeriodEnd: true,
      currentPeriodEnd: periodEndUnix ? new Date(periodEndUnix * 1000) : null,
    },
  });

  return NextResponse.json({ ok: true });
}
