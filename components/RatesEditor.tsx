"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ResolvedConfig } from "@/lib/settings";

type Props = { config: ResolvedConfig };

export default function RatesEditor({ config }: Props) {
  const router = useRouter();
  const [rates, setRates] = useState<Record<string, number>>(
    Object.fromEntries(config.listings.map((l) => [l.slug, l.nightly])),
  );
  const [cleaningFee, setCleaningFee] = useState<number>(
    config.policies.cleaningFee,
  );
  const [petFee, setPetFee] = useState<number>(config.policies.petFee);
  const [minimumNights, setMinimumNights] = useState<number>(
    config.policies.minimumNights,
  );
  const [approvalWindow, setApprovalWindow] = useState<number>(
    config.policies.approvalWindowHours,
  );
  const [taxRate, setTaxRate] = useState<number>(
    config.policies.taxRate * 100,
  );
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        rates,
        policies: {
          cleaningFee: Number(cleaningFee),
          petFee: Number(petFee),
          minimumNights: Number(minimumNights),
          approvalWindowHours: Number(approvalWindow),
          taxRate: Number(taxRate) / 100,
        },
      }),
    });
    setBusy(false);
    if (!res.ok) {
      setError(await res.text());
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
    router.refresh();
  }

  return (
    <div style={{ display: "grid", gap: "1.4rem" }}>
      <div>
        <h3 className="serif" style={{ fontSize: "1rem", margin: "0 0 .8rem" }}>
          Nightly rates
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1rem",
          }}
        >
          {config.listings.map((l) => (
            <label key={l.slug} className="field" style={{ marginBottom: 0 }}>
              <span className="lbl">{l.shortName}</span>
              <input
                type="number"
                min={0}
                step={1}
                value={rates[l.slug]}
                onChange={(e) =>
                  setRates({
                    ...rates,
                    [l.slug]: parseInt(e.target.value || "0", 10),
                  })
                }
              />
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="serif" style={{ fontSize: "1rem", margin: "0 0 .8rem" }}>
          Fees and policies
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "1rem",
          }}
        >
          <label className="field" style={{ marginBottom: 0 }}>
            <span className="lbl">Cleaning fee ($)</span>
            <input
              type="number"
              min={0}
              step={1}
              value={cleaningFee}
              onChange={(e) =>
                setCleaningFee(parseInt(e.target.value || "0", 10))
              }
            />
          </label>
          <label className="field" style={{ marginBottom: 0 }}>
            <span className="lbl">Pet fee ($)</span>
            <input
              type="number"
              min={0}
              step={1}
              value={petFee}
              onChange={(e) => setPetFee(parseInt(e.target.value || "0", 10))}
            />
          </label>
          <label className="field" style={{ marginBottom: 0 }}>
            <span className="lbl">Min nights</span>
            <input
              type="number"
              min={1}
              step={1}
              value={minimumNights}
              onChange={(e) =>
                setMinimumNights(parseInt(e.target.value || "1", 10))
              }
            />
          </label>
          <label className="field" style={{ marginBottom: 0 }}>
            <span className="lbl">Approval (hours)</span>
            <input
              type="number"
              min={1}
              step={1}
              value={approvalWindow}
              onChange={(e) =>
                setApprovalWindow(parseInt(e.target.value || "24", 10))
              }
            />
          </label>
          <label className="field" style={{ marginBottom: 0 }}>
            <span className="lbl">Tax rate (%)</span>
            <input
              type="number"
              min={0}
              step={0.01}
              value={taxRate}
              onChange={(e) => setTaxRate(parseFloat(e.target.value || "0"))}
            />
          </label>
        </div>
      </div>

      {error && (
        <p style={{ color: "#8a2a21", fontSize: ".88rem", margin: 0 }}>
          {error}
        </p>
      )}
      <div>
        <button onClick={save} className="btn" disabled={busy}>
          {busy ? "Saving…" : saved ? "Saved" : "Save changes"}
        </button>
      </div>
      <p style={{ color: "var(--ink3)", fontSize: ".8rem", margin: 0 }}>
        These override the defaults in <code>lib/listings.ts</code>. Any guest
        request from here on uses these values.
      </p>
    </div>
  );
}
