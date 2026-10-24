import { NextRequest, NextResponse } from "next/server";
import { stripe, stripeConfigured } from "@/lib/stripe";
import { markPaid } from "@/lib/db";

export const runtime = "nodejs";

// Stripe calls this after a Checkout Session completes. In Vercel settings,
// set STRIPE_WEBHOOK_SECRET to the secret shown when you create the webhook
// endpoint in the Stripe dashboard, pointing it to this URL.
export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const s = stripe();
  if (!stripeConfigured() || !s || !secret) {
    return new NextResponse("Stripe not configured.", { status: 503 });
  }
  const sig = req.headers.get("stripe-signature");
  if (!sig) return new NextResponse("Missing signature.", { status: 400 });
  const raw = await req.text();
  let event;
  try {
    event = s.webhooks.constructEvent(raw, sig, secret);
  } catch (err) {
    return new NextResponse(
      `Webhook signature verification failed: ${(err as Error).message}`,
      { status: 400 },
    );
  }
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as { client_reference_id?: string };
    const rid = session.client_reference_id;
    if (rid) {
      try {
        await markPaid(rid);
      } catch (err) {
        console.error("markPaid failed", err);
      }
    }
  }
  return NextResponse.json({ received: true });
}
