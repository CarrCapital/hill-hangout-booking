import { neon } from "@neondatabase/serverless";

// Vercel's Neon integration sets DATABASE_URL (and keeps POSTGRES_URL for
// backwards compatibility). Accept either.
function connectionString(): string | undefined {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL;
}

export function dbConfigured(): boolean {
  return Boolean(connectionString());
}

function client() {
  const cs = connectionString();
  if (!cs) throw new Error("Database not configured.");
  return neon(cs);
}

export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS requests (
  id             TEXT PRIMARY KEY,
  listing_slug   TEXT NOT NULL,
  check_in       DATE NOT NULL,
  check_out      DATE NOT NULL,
  guests         INT  NOT NULL,
  bringing_pet   BOOLEAN NOT NULL DEFAULT FALSE,
  name           TEXT NOT NULL,
  email          TEXT NOT NULL,
  phone          TEXT NOT NULL,
  purpose        TEXT,
  nightly        NUMERIC(10,2) NOT NULL,
  subtotal       NUMERIC(10,2) NOT NULL,
  cleaning_fee   NUMERIC(10,2) NOT NULL,
  pet_fee        NUMERIC(10,2) NOT NULL,
  tax            NUMERIC(10,2) NOT NULL,
  total          NUMERIC(10,2) NOT NULL,
  status         TEXT NOT NULL DEFAULT 'pending',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  decided_at     TIMESTAMPTZ,
  note           TEXT
);
CREATE INDEX IF NOT EXISTS requests_status_idx ON requests (status);
CREATE INDEX IF NOT EXISTS requests_dates_idx ON requests (check_in, check_out);
`;

export type RequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "paid"
  | "expired";

export type BookingRequest = {
  id: string;
  listing_slug: string;
  check_in: string;
  check_out: string;
  guests: number;
  bringing_pet: boolean;
  name: string;
  email: string;
  phone: string;
  purpose: string | null;
  nightly: string;
  subtotal: string;
  cleaning_fee: string;
  pet_fee: string;
  tax: string;
  total: string;
  status: RequestStatus;
  created_at: string;
  decided_at: string | null;
  note: string | null;
};

let schemaReady: Promise<void> | null = null;
export function ensureSchema(): Promise<void> {
  if (!dbConfigured()) return Promise.resolve();
  if (!schemaReady) {
    const sql = client();
    schemaReady = (async () => {
      // Neon's tagged-template `sql` interpolates parameters, so for raw DDL
      // (no parameters) we use sql.query, which accepts a plain string.
      for (const stmt of SCHEMA_SQL.split(";").map((s) => s.trim()).filter(Boolean)) {
        await sql.query(stmt);
      }
    })();
  }
  return schemaReady;
}

export async function insertRequest(r: {
  id: string;
  listing_slug: string;
  check_in: string;
  check_out: string;
  guests: number;
  bringing_pet: boolean;
  name: string;
  email: string;
  phone: string;
  purpose: string;
  nightly: number;
  subtotal: number;
  cleaning_fee: number;
  pet_fee: number;
  tax: number;
  total: number;
}) {
  await ensureSchema();
  const sql = client();
  await sql`
    INSERT INTO requests
      (id, listing_slug, check_in, check_out, guests, bringing_pet,
       name, email, phone, purpose, nightly, subtotal, cleaning_fee,
       pet_fee, tax, total)
    VALUES
      (${r.id}, ${r.listing_slug}, ${r.check_in}, ${r.check_out},
       ${r.guests}, ${r.bringing_pet}, ${r.name}, ${r.email}, ${r.phone},
       ${r.purpose}, ${r.nightly}, ${r.subtotal}, ${r.cleaning_fee},
       ${r.pet_fee}, ${r.tax}, ${r.total})
  `;
}

export async function listRequests(): Promise<BookingRequest[]> {
  await ensureSchema();
  const sql = client();
  const rows = (await sql`
    SELECT * FROM requests ORDER BY created_at DESC LIMIT 200
  `) as unknown as BookingRequest[];
  return rows;
}

export async function setStatus(
  id: string,
  status: RequestStatus,
  note?: string,
) {
  await ensureSchema();
  const sql = client();
  await sql`
    UPDATE requests
       SET status = ${status},
           decided_at = NOW(),
           note = COALESCE(${note ?? null}, note)
     WHERE id = ${id}
  `;
}

export async function blockedRanges(slug: string): Promise<
  Array<{ check_in: string; check_out: string }>
> {
  await ensureSchema();
  const sql = client();
  const slugs =
    slug === "combined" ? ["combined", "lower", "main"] : [slug, "combined"];
  const rows = (await sql`
    SELECT check_in, check_out
      FROM requests
     WHERE status IN ('approved','paid')
       AND listing_slug = ANY(${slugs})
  `) as unknown as Array<{ check_in: string; check_out: string }>;
  return rows;
}
