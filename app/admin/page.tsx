import Link from "next/link";
import { listRequests, listBlocks, dbConfigured } from "@/lib/db";
import { formatMoney } from "@/lib/pricing";
import { resolveConfig } from "@/lib/settings";
import { stripeConfigured } from "@/lib/stripe";
import AdminActions from "@/components/AdminActions";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!dbConfigured()) {
    return (
      <div className="wrap" style={{ padding: "3rem 0" }}>
        <h1
          className="serif font-light"
          style={{ fontSize: "2rem", margin: "0 0 1rem" }}
        >
          Admin
        </h1>
        <p style={{ color: "var(--ink2)" }}>
          Database is not connected yet. In the Vercel dashboard, open this
          project, go to <strong>Storage</strong>, click{" "}
          <strong>Create</strong>, pick <strong>Postgres (Neon)</strong>, and
          attach it. Then redeploy. Requests from the public site will start
          saving here.
        </p>
      </div>
    );
  }

  const [rows, blocks, cfg] = await Promise.all([
    listRequests(),
    listBlocks(),
    resolveConfig(),
  ]);

  return (
    <div className="wide" style={{ padding: "2.4rem 0 3rem" }}>
      <div style={{ display: "flex", gap: "1rem", alignItems: "baseline" }}>
        <h1
          className="serif font-light"
          style={{ fontSize: "2rem", margin: 0 }}
        >
          Admin
        </h1>
        <nav style={{ display: "flex", gap: "1rem", marginLeft: "auto" }}>
          <a href="#requests" style={{ color: "var(--ink3)", fontSize: ".85rem" }}>
            Requests
          </a>
          <a href="#blocks" style={{ color: "var(--ink3)", fontSize: ".85rem" }}>
            Blocks
          </a>
          <a href="#rates" style={{ color: "var(--ink3)", fontSize: ".85rem" }}>
            Rates
          </a>
        </nav>
      </div>

      <section id="requests" style={{ margin: "2.4rem 0 3rem" }}>
        <h2 className="serif font-light" style={{ fontSize: "1.4rem", margin: "0 0 1rem" }}>
          Requests
        </h2>
        {rows.length === 0 ? (
          <p style={{ color: "var(--ink2)" }}>No requests yet.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".9rem" }}>
            <thead>
              <tr style={{ color: "var(--ink3)", textAlign: "left" }}>
                <th style={{ padding: ".6rem 0" }}>Guest</th>
                <th style={{ padding: ".6rem 0" }}>Stay</th>
                <th style={{ padding: ".6rem 0" }}>Dates</th>
                <th style={{ padding: ".6rem 0" }}>Guests</th>
                <th style={{ padding: ".6rem 0" }}>Total</th>
                <th style={{ padding: ".6rem 0" }}>Status</th>
                <th style={{ padding: ".6rem 0" }}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} style={{ borderTop: "1px solid var(--line2)" }}>
                  <td style={{ padding: ".9rem 0", verticalAlign: "top" }}>
                    <div style={{ color: "var(--ink)" }}>{r.name}</div>
                    <div style={{ color: "var(--ink3)", fontSize: ".82rem" }}>
                      {r.email}
                      <br />
                      {r.phone}
                    </div>
                    {r.bringing_pet && (
                      <div className="pill" style={{ marginTop: ".4rem" }}>
                        pet
                      </div>
                    )}
                  </td>
                  <td style={{ padding: ".9rem 0", verticalAlign: "top" }}>
                    {r.listing_slug}
                  </td>
                  <td style={{ padding: ".9rem 0", verticalAlign: "top" }}>
                    {r.check_in.slice(0, 10)} → {r.check_out.slice(0, 10)}
                  </td>
                  <td style={{ padding: ".9rem 0", verticalAlign: "top" }}>
                    {r.guests}
                  </td>
                  <td style={{ padding: ".9rem 0", verticalAlign: "top" }}>
                    {formatMoney(parseFloat(r.total))}
                  </td>
                  <td style={{ padding: ".9rem 0", verticalAlign: "top" }}>
                    <span className={`statepill state-${r.status}`}>
                      {r.status}
                    </span>
                  </td>
                  <td style={{ padding: ".9rem 0", verticalAlign: "top" }}>
                    <AdminActions
                      id={r.id}
                      status={r.status}
                      paymentUrl={r.stripe_payment_url}
                      stripeReady={stripeConfigured()}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!stripeConfigured() && (
          <p
            style={{
              color: "var(--ink3)",
              fontSize: ".8rem",
              marginTop: "1.5rem",
            }}
          >
            Payment collection is disabled: add <code>STRIPE_SECRET_KEY</code>{" "}
            in Vercel env vars and redeploy. Approvals will then generate a
            Stripe Checkout link you can send to the guest.
          </p>
        )}
      </section>

      <section id="blocks" style={{ margin: "0 0 3rem" }}>
        <h2
          className="serif font-light"
          style={{ fontSize: "1.4rem", margin: "0 0 1rem" }}
        >
          Blocked dates
        </h2>
        <p
          style={{
            color: "var(--ink3)",
            fontSize: ".86rem",
            marginBottom: "1rem",
          }}
        >
          Use blocks for owner stays, maintenance, or anything else that
          shouldn't be bookable. A block on Combined blocks Lower + Main, and
          vice versa.
        </p>
        <BlockEditor existing={blocks} listings={cfg.listings} />
      </section>

      <section id="rates">
        <h2
          className="serif font-light"
          style={{ fontSize: "1.4rem", margin: "0 0 1rem" }}
        >
          Rates and policies
        </h2>
        <RatesEditor config={cfg} />
      </section>
    </div>
  );
}

// Server component wrappers for the client editors below.
import BlockEditorClient from "@/components/BlockEditor";
import RatesEditorClient from "@/components/RatesEditor";
function BlockEditor(props: Parameters<typeof BlockEditorClient>[0]) {
  return <BlockEditorClient {...props} />;
}
function RatesEditor(props: Parameters<typeof RatesEditorClient>[0]) {
  return <RatesEditorClient {...props} />;
}
