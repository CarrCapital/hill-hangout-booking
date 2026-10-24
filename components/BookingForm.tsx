"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Listing } from "@/lib/listings";
import { POLICIES } from "@/lib/listings";
import { quote, formatMoney } from "@/lib/pricing";

type Props = {
  listing: Listing;
  blocked: Array<{ check_in: string; check_out: string }>;
};

function today(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}
function addDays(iso: string, n: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function overlaps(
  a: string,
  b: string,
  blocked: Array<{ check_in: string; check_out: string }>,
): boolean {
  // Simple interval overlap: [a, b) vs [in, out)
  return blocked.some((r) => a < r.check_out && b > r.check_in);
}

export default function BookingForm({ listing, blocked }: Props) {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState(addDays(today(), 14));
  const [checkOut, setCheckOut] = useState(
    addDays(today(), 14 + POLICIES.minimumNights),
  );
  const [guests, setGuests] = useState(2);
  const [pet, setPet] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [purpose, setPurpose] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const q = useMemo(
    () => quote(listing, checkIn, checkOut, pet),
    [listing, checkIn, checkOut, pet],
  );

  const belowMin = q.nights > 0 && q.nights < POLICIES.minimumNights;
  const dateProblem =
    q.nights <= 0
      ? "Choose a checkout after your check-in."
      : belowMin
        ? `Minimum stay is ${POLICIES.minimumNights} nights.`
        : overlaps(checkIn, checkOut, blocked)
          ? "Some of these nights are already booked. Please pick different dates."
          : null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (dateProblem) {
      setError(dateProblem);
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
          check_in: checkIn,
          check_out: checkOut,
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
      <div className="row2">
        <label className="field">
          <span className="lbl">Check in</span>
          <input
            type="date"
            value={checkIn}
            min={today()}
            onChange={(e) => {
              const v = e.target.value;
              setCheckIn(v);
              if (v >= checkOut) setCheckOut(addDays(v, POLICIES.minimumNights));
            }}
          />
        </label>
        <label className="field">
          <span className="lbl">Check out</span>
          <input
            type="date"
            value={checkOut}
            min={addDays(checkIn, 1)}
            onChange={(e) => setCheckOut(e.target.value)}
          />
        </label>
      </div>

      <div className="row2">
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
            <option value="yes">Yes (pet fee applies, must be approved)</option>
          </select>
        </label>
      </div>

      <div
        className="price-rows"
        style={{ margin: "1rem 0 1.6rem", borderTop: "1px solid var(--line)" }}
      >
        <div>
          <span>
            {q.nights || 0} night{q.nights === 1 ? "" : "s"} ×{" "}
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
          <span>DC tax ({(POLICIES.taxRate * 100).toFixed(2)}%)</span>
          <span>{formatMoney(q.tax)}</span>
        </div>
        <div className="total">
          <span>Total</span>
          <span>{formatMoney(q.total)}</span>
        </div>
      </div>

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

      <button
        type="submit"
        className="btn"
        disabled={submitting || !!dateProblem}
      >
        {submitting ? "Sending…" : "Send request"}
      </button>
      <p
        style={{
          color: "var(--ink3)",
          fontSize: ".82rem",
          marginTop: ".9rem",
        }}
      >
        No payment now. You'll hear back within {POLICIES.approvalWindowHours}{" "}
        hours.
      </p>
    </form>
  );
}
