import Link from "next/link";
import { formatMoney } from "@/lib/pricing";
import { resolveConfig } from "@/lib/settings";
import HomeAvailability from "@/components/HomeAvailability";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { listings, policies } = await resolveConfig();

  return (
    <div>
      <section className="wide text-center" style={{ padding: "4rem 0 2rem" }}>
        <p
          className="serif italic m-0"
          style={{ color: "var(--ink3)", fontSize: ".92rem" }}
        >
          {policies.brand.tagline}
        </p>
        <h1
          className="serif font-light m-0"
          style={{
            fontSize: "clamp(2.6rem,10vw,4rem)",
            lineHeight: 1,
            letterSpacing: "-0.015em",
            marginTop: ".9rem",
          }}
        >
          Book Hill Hangout direct.
        </h1>
        <p
          className="serif m-0"
          style={{
            color: "var(--ink2)",
            marginTop: "1.5rem",
            fontSize: "1.08rem",
            maxWidth: "34rem",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Three ways to stay. One upstairs home, one two-bedroom suite below,
          or the whole house together. Pick dates, send a request, hear back
          within {policies.approvalWindowHours} hours.
        </p>
        <p style={{ marginTop: "1.6rem" }}>
          <a href="#dates" className="btn">
            Check dates
          </a>
        </p>
        <hr className="hr" />
      </section>

      <HomeAvailability
        listings={listings}
        policies={{
          cleaningFee: policies.cleaningFee,
          petFee: policies.petFee,
          taxRate: policies.taxRate,
          minimumNights: policies.minimumNights,
          approvalWindowHours: policies.approvalWindowHours,
        }}
      />

      <section id="house" className="wrap" style={{ padding: "3rem 0 1rem" }}>
        <h2 className="serif font-light" style={{ fontSize: "1.8rem", margin: 0 }}>
          The house
        </h2>
        <p style={{ color: "var(--ink2)", marginTop: "1rem" }}>
          A renovated 1920s rowhouse in NoMa, two blocks from the metro and
          ten minutes from Union Station. Union Market around the corner, H
          Street up the hill, Capitol Hill a short walk. Split into two homes
          with their own entrances, used separately or combined for larger
          groups.
        </p>
        <p style={{ color: "var(--ink2)" }}>
          Rooftop with a view of the Capitol dome, open 7 AM to 11 PM. Hot
          tub, grill, outdoor dining, projector screen for movie nights.
          Washer and dryer. Fast Wi-Fi. Full kitchens on both floors.
        </p>
      </section>

      <section className="wrap" style={{ padding: "0 0 2rem" }}>
        <h3
          className="serif"
          style={{ fontSize: "1.05rem", margin: "1.4rem 0 .6rem" }}
        >
          Already know Hill Hangout from Airbnb?
        </h3>
        <p style={{ color: "var(--ink2)", margin: "0 0 .9rem" }}>
          Read verified guest reviews on our Airbnb listings.
        </p>
        <div style={{ display: "flex", gap: ".6rem", flexWrap: "wrap" }}>
          {listings.map((l) => (
            <a
              key={l.slug}
              href={`https://www.airbnb.com/rooms/${l.airbnbId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
              style={{ fontSize: ".82rem", padding: ".45rem .95rem" }}
            >
              Reviews: {l.shortName}
            </a>
          ))}
        </div>
      </section>

      <section id="faq" className="wrap" style={{ padding: "2rem 0 3rem" }}>
        <h2 className="serif font-light" style={{ fontSize: "1.8rem", margin: 0 }}>
          Good to know
        </h2>
        <div style={{ marginTop: "1.2rem" }} className="price-rows">
          <div>
            <span>Check in</span>
            <span style={{ color: "var(--ink)" }}>{policies.checkInTime}</span>
          </div>
          <div>
            <span>Check out</span>
            <span style={{ color: "var(--ink)" }}>{policies.checkOutTime}</span>
          </div>
          <div>
            <span>Minimum stay</span>
            <span style={{ color: "var(--ink)" }}>
              {policies.minimumNights} nights
            </span>
          </div>
          <div>
            <span>Cleaning fee</span>
            <span style={{ color: "var(--ink)" }}>
              {formatMoney(policies.cleaningFee)}
            </span>
          </div>
          <div>
            <span>DC tax</span>
            <span style={{ color: "var(--ink)" }}>
              {(policies.taxRate * 100).toFixed(2)}%
            </span>
          </div>
          <div>
            <span>Pets</span>
            <span style={{ color: "var(--ink)" }}>
              {formatMoney(policies.petFee)} per stay, must be approved
            </span>
          </div>
          <div>
            <span>Primary guest age</span>
            <span style={{ color: "var(--ink)" }}>{policies.minBookingAge}+</span>
          </div>
          <div>
            <span>Approval window</span>
            <span style={{ color: "var(--ink)" }}>
              {policies.approvalWindowHours} hours
            </span>
          </div>
        </div>
        <p
          style={{
            color: "var(--ink3)",
            fontSize: ".88rem",
            marginTop: "1.2rem",
          }}
        >
          Cancellation: {policies.cancellation}
        </p>
      </section>
    </div>
  );
}
