import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";

const checkoutPassSchema = z.object({
  passType: z.enum(["day", "week"]),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "You must be logged in" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = checkoutPassSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid pass type" }, { status: 400 });
  }
  const { passType } = parsed.data;
  const priceId =
    passType === "day" ? process.env.STRIPE_PRO_DAYPASS_PRICE_ID : process.env.STRIPE_PRO_WEEKPASS_PRICE_ID;

  const origin = new URL(req.url).origin;

  const checkoutSession = await getStripe().checkout.sessions.create({
    // One-time payment, not a subscription - no auto-renewal, "top-up anytime".
    mode: "payment",
    line_items: [{ price: priceId as string, quantity: 1 }],
    customer_email: session.user.email ?? undefined,
    client_reference_id: session.user.id,
    success_url: `${origin}/pricing?passSuccess=1`,
    cancel_url: `${origin}/pricing?canceled=1`,
    metadata: { userId: session.user.id, passType },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
