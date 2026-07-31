import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
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
        await prisma.subscription.upsert({
          where: { userId },
          create: {
            userId,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            tier: "PRO",
            status: "active",
          },
          update: {
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            tier: "PRO",
            status: "active",
          },
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
      if (userId) {
        await prisma.subscription.updateMany({
          where: { userId },
          data: { status: sub.status, tier: active ? "PRO" : "FREE" },
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
