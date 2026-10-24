"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminActions({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null);

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

  return (
    <div style={{ display: "flex", gap: ".4rem" }}>
      <button
        onClick={() => decide("approve")}
        disabled={!!busy}
        className="btn"
        style={{ padding: ".4rem .9rem", fontSize: ".78rem" }}
      >
        {busy === "approve" ? "…" : "Approve"}
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
