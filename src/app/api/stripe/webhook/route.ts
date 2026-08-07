import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendAdminAlert } from "@/lib/email";

function billingIntervalFrom(item: Stripe.SubscriptionItem | undefined): string | null {
  const interval = item?.price?.recurring?.interval;
  if (interval === "year") return "yearly";
  if (interval === "month") return "monthly";
  return null;
}

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

  try {
    await handleEvent(event);
  } catch (err) {
    // A failure here means a real payment event (money already moved) didn't get
    // recorded correctly - e.g. someone paid but didn't get flipped to Pro. That's
    // worth knowing about immediately, not discovering later from a confused user.
    const message = err instanceof Error ? err.message : String(err);
    await sendAdminAlert(
      "Stripe webhook handler failed",
      `Event type: ${event.type}\nEvent id: ${event.id}\nError: ${message}`
    ).catch(() => {});
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed": {
      const checkoutSession = event.data.object as Stripe.Checkout.Session;
      const userId = checkoutSession.metadata?.userId ?? checkoutSession.client_reference_id;
      const passType = checkoutSession.metadata?.passType;

      if (checkoutSession.mode === "payment" && userId && (passType === "day" || passType === "week")) {
        // One-time pass, not a subscription - grant proPassExpiresAt, don't touch
        // planTier/Subscription. "Top-up anytime": extend from whichever is later, the
        // current time or an already-active pass's expiry, rather than resetting it.
        const durationMs = (passType === "day" ? 24 : 24 * 7) * 60 * 60 * 1000;
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { proPassExpiresAt: true } });
        const currentExpiry = user?.proPassExpiresAt?.getTime() ?? 0;
        const newExpiresAt = new Date(Math.max(currentExpiry, Date.now()) + durationMs);
        await prisma.user.update({ where: { id: userId }, data: { proPassExpiresAt: newExpiresAt } });
        break;
      }

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
          billingInterval: billingIntervalFrom(sub?.items.data[0]),
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
            billingInterval: billingIntervalFrom(sub.items.data[0]),
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
}
