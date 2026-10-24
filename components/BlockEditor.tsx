"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Block } from "@/lib/db";
import type { Listing } from "@/lib/listings";

type Props = {
  existing: Block[];
  listings: Listing[];
};

export default function BlockEditor({ existing, listings }: Props) {
  const router = useRouter();
  const [slug, setSlug] = useState<Listing["slug"]>("combined");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!checkIn || !checkOut || checkOut <= checkIn) {
      setError("Pick a valid date range.");
      return;
    }
    setBusy(true);
    const res = await fetch("/api/admin/blocks", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        listing_slug: slug,
        check_in: checkIn,
        check_out: checkOut,
        reason,
      }),
    });
    setBusy(false);
    if (!res.ok) {
      setError(await res.text());
      return;
    }
    setCheckIn("");
    setCheckOut("");
    setReason("");
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Remove this block?")) return;
    const res = await fetch(`/api/admin/blocks/${id}`, { method: "DELETE" });
    if (!res.ok) {
      alert(await res.text());
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <form onSubmit={add} style={{ display: "grid", gap: "1rem" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 2fr",
            gap: "1rem",
          }}
        >
          <label className="field" style={{ marginBottom: 0 }}>
            <span className="lbl">Listing</span>
            <select
              value={slug}
              onChange={(e) => setSlug(e.target.value as Listing["slug"])}
            >
              {listings.map((l) => (
                <option key={l.slug} value={l.slug}>
                  {l.shortName}
                </option>
              ))}
            </select>
          </label>
          <label className="field" style={{ marginBottom: 0 }}>
            <span className="lbl">From</span>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
            />
          </label>
          <label className="field" style={{ marginBottom: 0 }}>
            <span className="lbl">To</span>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
            />
          </label>
          <label className="field" style={{ marginBottom: 0 }}>
            <span className="lbl">Reason (optional)</span>
            <input
              type="text"
              value={reason}
              placeholder="Owner stay, cleaning, hold"
              onChange={(e) => setReason(e.target.value)}
            />
          </label>
        </div>
        {error && (
          <p style={{ color: "#8a2a21", fontSize: ".88rem", margin: 0 }}>
            {error}
          </p>
        )}
        <div>
          <button type="submit" className="btn" disabled={busy}>
            {busy ? "Adding…" : "Add block"}
          </button>
        </div>
      </form>

      {existing.length > 0 && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: ".9rem",
            marginTop: "1.5rem",
          }}
        >
          <thead>
            <tr style={{ color: "var(--ink3)", textAlign: "left" }}>
              <th style={{ padding: ".5rem 0" }}>Listing</th>
              <th style={{ padding: ".5rem 0" }}>From</th>
              <th style={{ padding: ".5rem 0" }}>To</th>
              <th style={{ padding: ".5rem 0" }}>Reason</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {existing.map((b) => (
              <tr key={b.id} style={{ borderTop: "1px solid var(--line2)" }}>
                <td style={{ padding: ".6rem 0" }}>{b.listing_slug}</td>
                <td style={{ padding: ".6rem 0" }}>{b.check_in.slice(0, 10)}</td>
                <td style={{ padding: ".6rem 0" }}>
                  {b.check_out.slice(0, 10)}
                </td>
                <td style={{ padding: ".6rem 0", color: "var(--ink3)" }}>
                  {b.reason || "—"}
                </td>
                <td style={{ padding: ".6rem 0", textAlign: "right" }}>
                  <button
                    onClick={() => remove(b.id)}
                    className="btn btn-ghost"
                    style={{ padding: ".3rem .7rem", fontSize: ".72rem" }}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
