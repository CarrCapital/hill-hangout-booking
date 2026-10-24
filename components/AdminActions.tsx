"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  id: string;
  status: string;
  paymentUrl: string | null;
  stripeReady: boolean;
};

export default function AdminActions({
  id,
  status,
  paymentUrl,
  stripeReady,
}: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function decide(action: "approve" | "reject") {
    setBusy(action);
    const res = await fetch(`/api/admin/requests/${id}/${action}`, {
      method: "POST",
    });
    setBusy(null);
    if (!res.ok) {
      alert(await res.text());
      return;
    }
    router.refresh();
  }

  async function copyLink() {
    if (!paymentUrl) return;
    await navigator.clipboard.writeText(paymentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (status === "pending") {
    return (
      <div style={{ display: "flex", gap: ".4rem", flexWrap: "wrap" }}>
        <button
          onClick={() => decide("approve")}
          disabled={!!busy}
          className="btn"
          style={{ padding: ".4rem .9rem", fontSize: ".78rem" }}
        >
          {busy === "approve" ? "…" : stripeReady ? "Approve + payment link" : "Approve"}
        </button>
        <button
          onClick={() => decide("reject")}
          disabled={!!busy}
          className="btn btn-ghost"
          style={{ padding: ".4rem .9rem", fontSize: ".78rem" }}
        >
          {busy === "reject" ? "…" : "Reject"}
        </button>
      </div>
    );
  }

  if (status === "approved" && paymentUrl) {
    return (
      <div style={{ display: "flex", gap: ".4rem", flexWrap: "wrap" }}>
        <button
          onClick={copyLink}
          className="btn btn-ghost"
          style={{ padding: ".4rem .9rem", fontSize: ".78rem" }}
        >
          {copied ? "Copied" : "Copy pay link"}
        </button>
        <a
          href={paymentUrl}
          target="_blank"
          rel="noreferrer"
          className="btn btn-ghost"
          style={{
            padding: ".4rem .9rem",
            fontSize: ".78rem",
            textDecoration: "none",
          }}
        >
          Open
        </a>
      </div>
    );
  }

  return null;
}
