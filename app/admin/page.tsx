import { listRequests, dbConfigured } from "@/lib/db";
import { formatMoney } from "@/lib/pricing";
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
          <strong>Create</strong>, pick <strong>Postgres</strong>, and attach
          it. Then redeploy. Requests from the public site will start saving
          here.
        </p>
      </div>
    );
  }

  let rows;
  try {
    rows = await listRequests();
  } catch (err) {
    return (
      <div className="wrap" style={{ padding: "3rem 0" }}>
        <h1
          className="serif font-light"
          style={{ fontSize: "2rem", margin: "0 0 1rem" }}
        >
          Admin
        </h1>
        <p style={{ color: "#8a2a21" }}>{(err as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="wide" style={{ padding: "2.4rem 0 3rem" }}>
      <h1
        className="serif font-light"
        style={{ fontSize: "2rem", margin: "0 0 1.6rem" }}
      >
        Requests
      </h1>
      {rows.length === 0 ? (
        <p style={{ color: "var(--ink2)" }}>No requests yet.</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: ".9rem",
          }}
        >
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
              <tr
                key={r.id}
                style={{ borderTop: "1px solid var(--line2)" }}
              >
                <td style={{ padding: ".9rem 0", verticalAlign: "top" }}>
                  <div style={{ color: "var(--ink)" }}>{r.name}</div>
                  <div style={{ color: "var(--ink3)", fontSize: ".82rem" }}>
                    {r.email}
                    <br />
                    {r.phone}
                  </div>
                  {r.bringing_pet && (
                    <div
                      className="pill"
                      style={{ marginTop: ".4rem" }}
                    >
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
                  {r.status === "pending" && <AdminActions id={r.id} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p
        style={{ color: "var(--ink3)", fontSize: ".8rem", marginTop: "2rem" }}
      >
        Approve or reject turn the request into a decision. Payment collection
        turns on when the Stripe keys are added in Vercel settings.
      </p>
    </div>
  );
}
