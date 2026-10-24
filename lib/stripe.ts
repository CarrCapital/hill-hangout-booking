// Thin wrapper around Stripe. Returns null when the secret key is not set so
// callers can show a graceful "Stripe not configured" state instead of
// crashing.

import Stripe from "stripe";
import { getRequest, setStripeSession } from "./db";
import { getListing, POLICIES } from "./listings";

export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function stripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

function moneyLabel(name: string, cents: number) {
  return {
    quantity: 1,
    price_data: {
      currency: "usd",
      product_data: { name },
      unit_amount: cents,
    },
  } as Stripe.Checkout.SessionCreateParams.LineItem;
}

function originFromHeaders(host: string | null, proto: string | null) {
  if (!host) return "https://example.com";
  const scheme = proto || "https";
  return `${scheme}://${host}`;
}

/**
 * Build a Checkout Session for an approved booking. Returns {url, id} or
 * null if Stripe is not configured.
 */
export async function createCheckoutForRequest(
  requestId: string,
  host: string | null,
  proto: string | null,
): Promise<{ url: string; id: string } | null> {
  const s = stripe();
  if (!s) return null;
  const req = await getRequest(requestId);
  if (!req) throw new Error("Request not found.");

  const listing = getListing(req.listing_slug);
  if (!listing) throw new Error("Listing not found.");

  const subtotalCents = Math.round(parseFloat(req.subtotal) * 100);
  const cleaningCents = Math.round(parseFloat(req.cleaning_fee) * 100);
  const petCents = Math.round(parseFloat(req.pet_fee) * 100);
  const taxCents = Math.round(parseFloat(req.tax) * 100);

  const items: Stripe.Checkout.SessionCreateParams.LineItem[] = [
    moneyLabel(
      `${listing.shortName}: ${req.check_in.slice(0, 10)} to ${req.check_out.slice(0, 10)}`,
      subtotalCents,
    ),
    moneyLabel("Cleaning fee", cleaningCents),
  ];
  if (petCents > 0) items.push(moneyLabel("Pet fee", petCents));
  items.push(
    moneyLabel(`DC tax (${(POLICIES.taxRate * 100).toFixed(2)}%)`, taxCents),
  );

  const origin = originFromHeaders(host, proto);
  const session = await s.checkout.sessions.create({
    mode: "payment",
    customer_email: req.email,
    client_reference_id: req.id,
    line_items: items,
    metadata: { request_id: req.id, listing: req.listing_slug },
    payment_method_types: [
      "card",
      "us_bank_account",
      "cashapp",
    ],
    success_url: `${origin}/book/${req.listing_slug}/paid?rid=${req.id}`,
    cancel_url: `${origin}/pay/${req.id}`,
    allow_promotion_codes: false,
  });

  if (!session.url) throw new Error("Stripe did not return a session URL.");
  await setStripeSession(req.id, session.id, session.url);
  return { url: session.url, id: session.id };
}
