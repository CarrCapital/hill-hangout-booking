import Link from "next/link";
import { formatMoney } from "@/lib/pricing";
import { resolveConfig } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { listings, policies } = await resolveConfig();

  return (
    <div>
      <section className="wide text-center" style={{ padding: "4.5rem 0 2rem" }}>
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
          Three ways to stay. One upstairs home, one two-bedroom suite on the
          lower level, or the whole house together. Pick dates, send a request,
          hear back within {policies.approvalWindowHours} hours.
        </p>
        <hr className="hr" />
      </section>

      <section id="stays" className="wide">
        <h2 className="serif font-light" style={{ fontSize: "1.6rem", margin: 0 }}>
          Choose a stay
        </h2>
        <div className="grid3">
          {listings.map((l) => (
            <Link key={l.slug} href={`/listings/${l.slug}`} className="listingcard">
              <div className="photo">
                <img src={l.heroPhoto} alt={l.name} />
              </div>
              <div className="body">
                <div className="pill" style={{ marginBottom: ".6rem" }}>
                  sleeps {l.maxGuests}
                </div>
                <div className="serif" style={{ fontSize: "1.2rem", lineHeight: 1.25 }}>
                  {l.shortName}
                </div>
                <p
                  className="m-0"
                  style={{
                    color: "var(--ink2)",
                    fontSize: ".92rem",
                    marginTop: ".4rem",
                  }}
                >
                  {l.blurb}
                </p>
                <p
                  className="m-0 serif"
                  style={{ marginTop: ".9rem", fontSize: "1.05rem" }}
                >
                  {formatMoney(l.nightly)}
                  <span
                    style={{
                      fontFamily: "inherit",
                      color: "var(--ink3)",
                      fontSize: ".85rem",
                    }}
                  >
                    {" "}
                    / night
                  </span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section id="house" className="wrap" style={{ padding: "3rem 0" }}>
        <h2 className="serif font-light" style={{ fontSize: "1.8rem", margin: 0 }}>
          The house
        </h2>
        <p style={{ color: "var(--ink2)", marginTop: "1rem" }}>
          A 1920s rowhouse in NoMa, two blocks from the metro and ten minutes
          from Union Station. Union Market around the corner, H Street up the
          hill, Capitol Hill a short walk. Split into two homes with their own
          entrances, used separately or combined for larger groups.
        </p>
        <p style={{ color: "var(--ink2)" }}>
          Rooftop with a view of the Capitol dome, open 7 AM to 11 PM. Hot tub,
          grill, outdoor dining, projector screen for movie nights. Washer and
          dryer. Fast Wi-Fi. Full kitchens on both floors.
        </p>
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
