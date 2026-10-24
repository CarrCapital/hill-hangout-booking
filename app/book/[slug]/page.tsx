import { notFound } from "next/navigation";
import { blockedRanges, dbConfigured } from "@/lib/db";
import { resolveListing } from "@/lib/settings";
import BookingForm from "@/components/BookingForm";
import { LISTINGS } from "@/lib/listings";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return LISTINGS.map((l) => ({ slug: l.slug }));
}

type SP = { from?: string; to?: string };

function isDate(s: string | undefined): s is string {
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

export default async function BookPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SP>;
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const { listing: l, policies } = await resolveListing(slug);
  if (!l) notFound();

  let blocked: Array<{ check_in: string; check_out: string }> = [];
  let dbWarning: string | null = null;
  if (dbConfigured()) {
    try {
      blocked = await blockedRanges(l.slug);
    } catch (err) {
      dbWarning = (err as Error).message;
    }
  } else {
    dbWarning =
      "Database not connected yet. The form still works for testing, but requests will not persist. Add Vercel Postgres (Neon) in the dashboard to turn it on.";
  }

  const initialFrom = isDate(sp.from) ? sp.from : null;
  const initialTo = isDate(sp.to) ? sp.to : null;

  return (
    <div className="wrap" style={{ padding: "2.4rem 0 3rem" }}>
      <p
        className="serif italic"
        style={{ color: "var(--ink3)", margin: 0, fontSize: ".92rem" }}
      >
        Requesting
      </p>
      <h1
        className="serif font-light"
        style={{
          fontSize: "clamp(1.9rem,6vw,2.4rem)",
          lineHeight: 1.1,
          letterSpacing: "-.012em",
          margin: ".3rem 0 1.6rem",
        }}
      >
        {l.name}
      </h1>

      {dbWarning && (
        <div
          style={{
            border: "1px solid var(--line)",
            padding: ".9rem 1rem",
            fontSize: ".84rem",
            color: "var(--ink2)",
            marginBottom: "1.4rem",
            borderLeft: "3px solid var(--accent)",
          }}
        >
          {dbWarning}
        </div>
      )}

      <BookingForm
        listing={l}
        blocked={blocked}
        policies={policies}
        initialFrom={initialFrom}
        initialTo={initialTo}
      />
    </div>
  );
}
