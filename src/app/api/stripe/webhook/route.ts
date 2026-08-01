import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature as string,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const checkoutSession = event.data.object as Stripe.Checkout.Session;
      const userId = checkoutSession.metadata?.userId ?? checkoutSession.client_reference_id;
      const customerId = checkoutSession.customer as string;
      const subscriptionId = checkoutSession.subscription as string;
      if (userId && customerId) {
        const sub = subscriptionId ? await getStripe().subscriptions.retrieve(subscriptionId) : null;
        const periodEndUnix = sub?.items.data[0]?.current_period_end;
        const subFields = {
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          tier: "PRO" as const,
          status: "active",
          cancelAtPeriodEnd: sub?.cancel_at_period_end ?? false,
          currentPeriodEnd: periodEndUnix ? new Date(periodEndUnix * 1000) : null,
        };
        await prisma.subscription.upsert({
          where: { userId },
          create: { userId, ...subFields },
          update: subFields,
        });
        await prisma.user.update({ where: { id: userId }, data: { planTier: "PRO" } });
      }
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.userId;
      const active = sub.status === "active" || sub.status === "trialing";
      const periodEndUnix = sub.items.data[0]?.current_period_end;
      if (userId) {
        await prisma.subscription.updateMany({
          where: { userId },
          data: {
            status: sub.status,
            tier: active ? "PRO" : "FREE",
            cancelAtPeriodEnd: sub.cancel_at_period_end,
            currentPeriodEnd: periodEndUnix ? new Date(periodEndUnix * 1000) : null,
          },
        });
        await prisma.user.update({
          where: { id: userId },
          data: { planTier: active ? "PRO" : "FREE" },
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
