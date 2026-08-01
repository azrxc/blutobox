import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

const checkoutSchema = z.object({
  interval: z.enum(["monthly", "yearly"]).default("monthly"),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "You must be logged in" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = checkoutSchema.safeParse(body);
  const interval = parsed.success ? parsed.data.interval : "monthly";
  const priceId = interval === "yearly" ? process.env.STRIPE_PRO_YEARLY_PRICE_ID : process.env.STRIPE_PRO_PRICE_ID;

  const origin = new URL(req.url).origin;

  const existing = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });

  const checkoutSession = await getStripe().checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId as string, quantity: 1 }],
    customer: existing?.stripeCustomerId,
    customer_email: existing ? undefined : session.user.email ?? undefined,
    client_reference_id: session.user.id,
    success_url: `${origin}/pricing?success=1`,
    cancel_url: `${origin}/pricing?canceled=1`,
    metadata: { userId: session.user.id },
    subscription_data: { metadata: { userId: session.user.id } },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
