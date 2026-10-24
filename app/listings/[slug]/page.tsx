import { notFound } from "next/navigation";
import Link from "next/link";
import { LISTINGS, POLICIES } from "@/lib/listings";
import { resolveListing } from "@/lib/settings";
import { formatMoney } from "@/lib/pricing";
import LocationMap from "@/components/LocationMap";

export function generateStaticParams() {
  return LISTINGS.map((l) => ({ slug: l.slug }));
}

export const dynamic = "force-dynamic";

export default async function ListingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { listing: l, policies } = await resolveListing(slug);
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
          loading="eager"
        />
      </figure>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(10rem, 1fr))",
          gap: ".5rem",
          marginTop: ".55rem",
        }}
      >
        {l.photos.slice(1).map((p, i) => (
          <img
            key={i}
            src={p}
            alt=""
            loading="lazy"
            style={{
              width: "100%",
              aspectRatio: "4/3",
              objectFit: "cover",
              border: "1px solid var(--line2)",
            }}
          />
        ))}
      </div>

      <p
        style={{
          color: "var(--ink2)",
          marginTop: "1.6rem",
          fontSize: "1rem",
          lineHeight: 1.7,
        }}
      >
        {l.shortDescription}
      </p>

      <div className="price-rows" style={{ marginTop: "1.4rem" }}>
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
          <span>Beds</span>
          <span style={{ color: "var(--ink)" }}>{l.beds}</span>
        </div>
        <div>
          <span>Size</span>
          <span style={{ color: "var(--ink)" }}>
            {l.sqft.toLocaleString()} sq ft
          </span>
        </div>
        <div>
          <span>Minimum stay</span>
          <span style={{ color: "var(--ink)" }}>
            {policies.minimumNights} nights
          </span>
        </div>
      </div>

      <h2
        className="serif font-light"
        style={{ fontSize: "1.3rem", margin: "2.2rem 0 .8rem" }}
      >
        About this place
      </h2>
      <div
        style={{
          color: "var(--ink2)",
          fontSize: ".97rem",
          lineHeight: 1.7,
          whiteSpace: "pre-wrap",
        }}
      >
        {l.longDescription}
      </div>

      <h2
        className="serif font-light"
        style={{ fontSize: "1.3rem", margin: "2.2rem 0 .8rem" }}
      >
        Why guests love this home
      </h2>
      <ul
        style={{
          color: "var(--ink2)",
          padding: 0,
          listStyle: "none",
          margin: 0,
          display: "grid",
          gap: ".35rem",
          fontSize: ".95rem",
        }}
      >
        {l.loveReasons.map((r) => (
          <li
            key={r}
            style={{
              borderBottom: "1px solid var(--line2)",
              padding: ".45rem 0",
            }}
          >
            ✓ {r}
          </li>
        ))}
      </ul>

      <h2
        className="serif font-light"
        style={{ fontSize: "1.3rem", margin: "2.2rem 0 .8rem" }}
      >
        Where you'll be
      </h2>
      <LocationMap
        lat={POLICIES.approxLat}
        lng={POLICIES.approxLng}
        neighborhood={POLICIES.neighborhood}
      />

      <h2
        className="serif font-light"
        style={{ fontSize: "1.3rem", margin: "2.2rem 0 .8rem" }}
      >
        Amenities
      </h2>
      <ul
        style={{
          color: "var(--ink2)",
          padding: 0,
          listStyle: "none",
          margin: 0,
          display: "grid",
          gap: ".35rem",
          fontSize: ".93rem",
        }}
      >
        {l.amenities.map((a) => (
          <li
            key={a}
            style={{
              borderBottom: "1px solid var(--line2)",
              padding: ".45rem 0",
            }}
          >
            {a}
          </li>
        ))}
      </ul>

      <h2
        className="serif font-light"
        style={{ fontSize: "1.3rem", margin: "2.2rem 0 .8rem" }}
      >
        House rules
      </h2>
      <ul
        style={{
          color: "var(--ink2)",
          padding: 0,
          listStyle: "none",
          margin: 0,
          display: "grid",
          gap: ".35rem",
          fontSize: ".93rem",
        }}
      >
        {policies.houseRules.map((r) => (
          <li
            key={r}
            style={{
              borderBottom: "1px solid var(--line2)",
              padding: ".45rem 0",
            }}
          >
            {r}
          </li>
        ))}
      </ul>

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
        Cancellation: {policies.cancellation}
      </p>
    </div>
  );
}
