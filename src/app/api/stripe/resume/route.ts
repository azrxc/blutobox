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

  await getStripe().subscriptions.update(subscription.stripeSubscriptionId, {
    cancel_at_period_end: false,
  });

  await prisma.subscription.update({
    where: { userId: session.user.id },
    data: { cancelAtPeriodEnd: false },
  });

  return NextResponse.json({ ok: true });
}
