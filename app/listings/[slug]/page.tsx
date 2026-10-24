import { notFound } from "next/navigation";
import Link from "next/link";
import { getListing, LISTINGS, POLICIES } from "@/lib/listings";
import { formatMoney } from "@/lib/pricing";

export function generateStaticParams() {
  return LISTINGS.map((l) => ({ slug: l.slug }));
}

export default async function ListingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const l = getListing(slug);
  if (!l) notFound();

  return (
    <div className="wrap" style={{ padding: "2.4rem 0 3rem" }}>
      <Link
        href="/"
        style={{
          color: "var(--ink3)",
          fontSize: ".82rem",
          textDecoration: "none",
          letterSpacing: ".04em",
        }}
      >
        ← All stays
      </Link>

      <h1
        className="serif font-light"
        style={{
          fontSize: "clamp(2.1rem, 7vw, 2.8rem)",
          lineHeight: 1.08,
          letterSpacing: "-.015em",
          margin: "1rem 0 .6rem",
        }}
      >
        {l.name}
      </h1>
      <p
        className="serif italic"
        style={{ color: "var(--ink2)", margin: 0, fontSize: "1rem" }}
      >
        {l.blurb}
      </p>

      <figure style={{ margin: "1.8rem 0 0" }}>
        <img
          src={l.heroPhoto}
          alt={l.name}
          style={{
            width: "100%",
            aspectRatio: "16/10",
            objectFit: "cover",
            border: "1px solid var(--line2)",
            display: "block",
          }}
        />
      </figure>

      <div className="price-rows" style={{ marginTop: "1.8rem" }}>
        <div>
          <span>Nightly</span>
          <span style={{ color: "var(--ink)" }}>{formatMoney(l.nightly)}</span>
        </div>
        <div>
          <span>Sleeps</span>
          <span style={{ color: "var(--ink)" }}>up to {l.maxGuests}</span>
        </div>
        <div>
          <span>Bedrooms</span>
          <span style={{ color: "var(--ink)" }}>{l.bedrooms}</span>
        </div>
        <div>
          <span>Bathrooms</span>
          <span style={{ color: "var(--ink)" }}>{l.bathrooms}</span>
        </div>
        <div>
          <span>Minimum stay</span>
          <span style={{ color: "var(--ink)" }}>
            {POLICIES.minimumNights} nights
          </span>
        </div>
      </div>

      <p style={{ color: "var(--ink2)", marginTop: "1.6rem" }}>{l.description}</p>

      <div style={{ marginTop: "2rem" }}>
        <Link href={`/book/${l.slug}`} className="btn">
          Request these dates
        </Link>
      </div>

      <p
        style={{
          color: "var(--ink3)",
          fontSize: ".82rem",
          marginTop: "1.3rem",
        }}
      >
        You'll pick dates on the next page. Request first, pay once approved.
      </p>
    </div>
  );
}
