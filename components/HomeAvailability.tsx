"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Calendar, { type DateRange, type BlockedRange } from "./Calendar";
import type { Listing } from "@/lib/listings";
import { quote, formatMoney } from "@/lib/pricing";

type Props = {
  listings: Listing[];
  policies: {
    cleaningFee: number;
    petFee: number;
    taxRate: number;
    minimumNights: number;
    approvalWindowHours: number;
  };
};

type AvailabilityResp = {
  lower: BlockedRange[];
  main: BlockedRange[];
  combined: BlockedRange[];
  dbConfigured: boolean;
};

function overlaps(from: string, to: string, blocks: BlockedRange[]): boolean {
  return blocks.some((b) => from < b.check_out && to > b.check_in);
}

export default function HomeAvailability({ listings, policies }: Props) {
  const [range, setRange] = useState<DateRange>({ from: null, to: null });
  const [blocked, setBlocked] = useState<Record<string, BlockedRange[]>>({
    lower: [],
    main: [],
    combined: [],
  });
  const [dbOk, setDbOk] = useState(true);

  useEffect(() => {
    fetch("/api/availability")
      .then((r) => r.json())
      .then((d: AvailabilityResp) => {
        setBlocked({
          lower: d.lower || [],
          main: d.main || [],
          combined: d.combined || [],
        });
        setDbOk(d.dbConfigured);
      })
      .catch(() => void 0);
  }, []);

  // Merge-all for the calendar: a day is greyed out only if ALL three listings
  // can't be booked that day. Lets guests see dates where at least one unit is
  // free. Per-listing availability is shown on the cards below.
  const unionBlocked = useMemo(() => {
    // A day is blocked on a listing-by-listing basis. For the "overview"
    // calendar we show the intersection: dates where every listing has a
    // conflict. In practice this means Combined's blocks block the calendar
    // (because they cascade), and single-listing blocks don't.
    const intersect: BlockedRange[] = [];
    const l = blocked.lower;
    const m = blocked.main;
    const c = blocked.combined;
    for (const cBlock of c) {
      // c already includes both l and m conflicts (blockedRanges cascades).
      intersect.push(cBlock);
    }
    // Dedupe
    const seen = new Set<string>();
    return intersect.filter((b) => {
      const key = `${b.check_in}-${b.check_out}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [blocked]);

  const rangeChosen = Boolean(range.from && range.to);

  return (
    <section id="dates" className="wide" style={{ padding: "0 0 2rem" }}>
      <h2
        className="serif font-light"
        style={{ fontSize: "1.6rem", margin: "0 0 .3rem" }}
      >
        Check dates
      </h2>
      <p
        style={{
          color: "var(--ink3)",
          fontSize: ".92rem",
          margin: "0 0 1rem",
        }}
      >
        Pick a check-in and check-out. We'll show which stays are open and
        what each would cost.
      </p>
      <Calendar
        value={range}
        onChange={setRange}
        blocked={unionBlocked}
        minimumNights={policies.minimumNights}
      />
      {!dbOk && (
        <p
          style={{
            color: "var(--ink3)",
            fontSize: ".78rem",
            marginTop: ".6rem",
          }}
        >
          Live availability is off until the database is connected. The
          calendar still works for picking dates.
        </p>
      )}

      <div className="grid3" style={{ marginTop: "2rem" }}>
        {listings.map((l) => {
          const taken = rangeChosen
            ? overlaps(range.from!, range.to!, blocked[l.slug] || [])
            : false;
          const q =
            rangeChosen && !taken
              ? quote(l, range.from!, range.to!, false, policies)
              : null;
          const href = rangeChosen
            ? `/book/${l.slug}?from=${range.from}&to=${range.to}`
            : `/listings/${l.slug}`;

          return (
            <Link key={l.slug} href={href} className="listingcard">
              <div className="photo">
                <img src={l.heroPhoto} alt={l.name} loading="lazy" />
              </div>
              <div className="body">
                <div
                  className="pill"
                  style={{ marginBottom: ".6rem" }}
                >
                  sleeps {l.maxGuests}
                </div>
                <div
                  className="serif"
                  style={{ fontSize: "1.2rem", lineHeight: 1.25 }}
                >
                  {l.shortName}
                </div>
                <p
                  className="m-0"
                  style={{
                    color: "var(--ink2)",
                    fontSize: ".9rem",
                    marginTop: ".4rem",
                  }}
                >
                  {l.blurb}
                </p>
                {rangeChosen ? (
                  taken ? (
                    <p
                      className="m-0"
                      style={{
                        marginTop: ".9rem",
                        fontSize: ".88rem",
                        color: "#8a2a21",
                      }}
                    >
                      Not available for these dates
                    </p>
                  ) : (
                    q && (
                      <>
                        <p
                          className="m-0 serif"
                          style={{
                            marginTop: ".9rem",
                            fontSize: "1.05rem",
                          }}
                        >
                          {formatMoney(q.total)}
                          <span
                            style={{
                              color: "var(--ink3)",
                              fontSize: ".82rem",
                            }}
                          >
                            {" "}
                            total, {q.nights} night{q.nights === 1 ? "" : "s"}
                          </span>
                        </p>
                        <p
                          className="m-0"
                          style={{
                            color: "var(--accent)",
                            fontSize: ".82rem",
                            marginTop: ".4rem",
                          }}
                        >
                          Available — tap to request
                        </p>
                      </>
                    )
                  )
                ) : (
                  <p
                    className="m-0 serif"
                    style={{ marginTop: ".9rem", fontSize: "1.05rem" }}
                  >
                    {formatMoney(l.nightly)}
                    <span
                      style={{
                        color: "var(--ink3)",
                        fontSize: ".82rem",
                      }}
                    >
                      {" "}
                      / night
                    </span>
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
