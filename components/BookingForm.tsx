"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Listing } from "@/lib/listings";
import { POLICIES } from "@/lib/listings";
import { quote, formatMoney } from "@/lib/pricing";
import Calendar, { type DateRange, type BlockedRange } from "./Calendar";

type Props = {
  listing: Listing;
  blocked: BlockedRange[];
  policies: typeof POLICIES;
};

export default function BookingForm({ listing, blocked, policies }: Props) {
  const router = useRouter();
  const [range, setRange] = useState<DateRange>({ from: null, to: null });
  const [guests, setGuests] = useState(2);
  const [pet, setPet] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [purpose, setPurpose] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const q = useMemo(
    () =>
      range.from && range.to
        ? quote(listing, range.from, range.to, pet, policies)
        : null,
    [listing, range, pet, policies],
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!range.from || !range.to) {
      setError("Pick your check-in and check-out dates on the calendar.");
      return;
    }
    if (!q || q.nights < policies.minimumNights) {
      setError(`Minimum stay is ${policies.minimumNights} nights.`);
      return;
    }
    if (guests > listing.maxGuests) {
      setError(`This listing sleeps up to ${listing.maxGuests}.`);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          listing_slug: listing.slug,
          check_in: range.from,
          check_out: range.to,
          guests,
          bringing_pet: pet,
          name,
          email,
          phone,
          purpose,
        }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Request failed.");
      }
      router.push(`/book/${listing.slug}/thanks`);
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <h3
        className="serif"
        style={{ fontSize: "1rem", margin: "0 0 .7rem", color: "var(--ink3)" }}
      >
        Choose dates
      </h3>
      <Calendar
        value={range}
        onChange={setRange}
        blocked={blocked}
        minimumNights={policies.minimumNights}
      />

      {range.from && (
        <p
          className="serif"
          style={{
            color: "var(--ink2)",
            margin: "1rem 0 0",
            fontSize: ".92rem",
          }}
        >
          {range.from}
          {range.to ? ` → ${range.to}` : " → pick checkout"}
          {q && q.nights > 0 && (
            <span style={{ color: "var(--ink3)" }}>
              {" "}
              · {q.nights} night{q.nights === 1 ? "" : "s"}
            </span>
          )}
        </p>
      )}

      <div className="row2" style={{ marginTop: "1.4rem" }}>
        <label className="field">
          <span className="lbl">Guests</span>
          <select
            value={guests}
            onChange={(e) => setGuests(parseInt(e.target.value, 10))}
          >
            {Array.from({ length: listing.maxGuests }, (_, i) => i + 1).map(
              (n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ),
            )}
          </select>
        </label>
        <label className="field">
          <span className="lbl">Bringing a pet?</span>
          <select
            value={pet ? "yes" : "no"}
            onChange={(e) => setPet(e.target.value === "yes")}
          >
            <option value="no">No</option>
            <option value="yes">
              Yes ({formatMoney(policies.petFee)} per stay, must be approved)
            </option>
          </select>
        </label>
      </div>

      {q && q.nights > 0 && (
        <div
          className="price-rows"
          style={{
            margin: "0 0 1.6rem",
            borderTop: "1px solid var(--line)",
          }}
        >
          <div>
            <span>
              {q.nights} night{q.nights === 1 ? "" : "s"} ×{" "}
              {formatMoney(listing.nightly)}
            </span>
            <span>{formatMoney(q.subtotal)}</span>
          </div>
          <div>
            <span>Cleaning fee</span>
            <span>{formatMoney(q.cleaningFee)}</span>
          </div>
          {pet && (
            <div>
              <span>Pet fee</span>
              <span>{formatMoney(q.petFee)}</span>
            </div>
          )}
          <div>
            <span>DC tax ({(policies.taxRate * 100).toFixed(2)}%)</span>
            <span>{formatMoney(q.tax)}</span>
          </div>
          <div className="total">
            <span>Total</span>
            <span>{formatMoney(q.total)}</span>
          </div>
        </div>
      )}

      <h3
        className="serif"
        style={{ fontSize: "1.1rem", margin: "1.6rem 0 .8rem" }}
      >
        About you
      </h3>
      <label className="field">
        <span className="lbl">Full name</span>
        <input
          required
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <div className="row2">
        <label className="field">
          <span className="lbl">Email</span>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="field">
          <span className="lbl">Phone</span>
          <input
            required
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </label>
      </div>
      <label className="field">
        <span className="lbl">What brings you to DC? (optional)</span>
        <textarea
          rows={3}
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          style={{ resize: "vertical" }}
        />
      </label>

      {error && (
        <p
          style={{
            color: "#8a2a21",
            fontSize: ".9rem",
            margin: "0 0 1rem",
          }}
        >
          {error}
        </p>
      )}

      <button type="submit" className="btn" disabled={submitting}>
        {submitting ? "Sending…" : "Send request"}
      </button>
      <p
        style={{
          color: "var(--ink3)",
          fontSize: ".82rem",
          marginTop: ".9rem",
        }}
      >
        No payment now. You'll hear back within {policies.approvalWindowHours}{" "}
        hours. Primary guest must be {POLICIES.minBookingAge} or older.
      </p>
    </form>
  );
}
