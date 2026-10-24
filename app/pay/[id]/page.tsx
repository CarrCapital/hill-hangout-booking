import Link from "next/link";
import { notFound } from "next/navigation";
import { getRequest } from "@/lib/db";
import { getListing, POLICIES } from "@/lib/listings";
import { formatMoney } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export default async function PayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const req = await getRequest(id).catch(() => null);
  if (!req) notFound();
  const listing = getListing(req.listing_slug);
  if (!listing) notFound();

  return (
    <div className="wrap" style={{ padding: "2.4rem 0 3rem" }}>
      <p
        className="serif italic"
        style={{ color: "var(--ink3)", margin: 0, fontSize: ".92rem" }}
      >
        Payment for your stay
      </p>
      <h1
        className="serif font-light"
        style={{
          fontSize: "clamp(1.9rem,6vw,2.4rem)",
          lineHeight: 1.1,
          letterSpacing: "-.012em",
          margin: ".3rem 0 1.6rem",
        }}
      >
        {listing.name}
      </h1>

      <div className="price-rows" style={{ marginTop: "1.4rem" }}>
        <div>
          <span>Dates</span>
          <span style={{ color: "var(--ink)" }}>
            {req.check_in.slice(0, 10)} → {req.check_out.slice(0, 10)}
          </span>
        </div>
        <div>
          <span>Guests</span>
          <span style={{ color: "var(--ink)" }}>{req.guests}</span>
        </div>
        <div>
          <span>Subtotal</span>
          <span>{formatMoney(parseFloat(req.subtotal))}</span>
        </div>
        <div>
          <span>Cleaning</span>
          <span>{formatMoney(parseFloat(req.cleaning_fee))}</span>
        </div>
        {parseFloat(req.pet_fee) > 0 && (
          <div>
            <span>Pet fee</span>
            <span>{formatMoney(parseFloat(req.pet_fee))}</span>
          </div>
        )}
        <div>
          <span>DC tax</span>
          <span>{formatMoney(parseFloat(req.tax))}</span>
        </div>
        <div className="total">
          <span>Total</span>
          <span>{formatMoney(parseFloat(req.total))}</span>
        </div>
      </div>

      <div style={{ margin: "2rem 0" }}>
        {req.status === "paid" ? (
          <p
            className="serif"
            style={{ color: "var(--accent)", fontSize: "1.05rem" }}
          >
            Paid. See you {req.check_in.slice(0, 10)}.
          </p>
        ) : req.status === "approved" && req.stripe_payment_url ? (
          <a href={req.stripe_payment_url} className="btn">
            Pay {formatMoney(parseFloat(req.total))}
          </a>
        ) : req.status === "approved" ? (
          <p style={{ color: "var(--ink2)" }}>
            Your dates were approved. Payment setup is almost done, your host
            will send you a link shortly.
          </p>
        ) : req.status === "pending" ? (
          <p style={{ color: "var(--ink2)" }}>
            Still waiting for approval. You'll hear back within{" "}
            {POLICIES.approvalWindowHours} hours.
          </p>
        ) : (
          <p style={{ color: "var(--ink2)" }}>
            This request is {req.status}. If this looks wrong,{" "}
            <Link href="/">start a new request</Link>.
          </p>
        )}
      </div>

      <p
        style={{
          color: "var(--ink3)",
          fontSize: ".82rem",
          marginTop: "1.5rem",
        }}
      >
        Pay with card, Apple Pay, Google Pay, Cash App Pay, or ACH bank
        transfer. All through Stripe.
      </p>
    </div>
  );
}
