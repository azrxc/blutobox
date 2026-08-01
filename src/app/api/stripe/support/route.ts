import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";

export async function GET() {
  return NextResponse.json({ available: Boolean(process.env.STRIPE_SUPPORT_PRICE_ID) });
}

export async function POST(req: Request) {
  const priceId = process.env.STRIPE_SUPPORT_PRICE_ID;
  if (!priceId) {
    return NextResponse.json({ error: "Support payments aren't set up yet" }, { status: 503 });
  }

  const session = await auth();
  const origin = new URL(req.url).origin;

  const checkoutSession = await getStripe().checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    customer_email: session?.user?.email ?? undefined,
    success_url: `${origin}/?supported=1`,
    cancel_url: `${origin}/pricing`,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
