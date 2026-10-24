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
  note           TEXT,
  stripe_session_id TEXT,
  stripe_payment_url TEXT,
  paid_at        TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS requests_status_idx ON requests (status);
CREATE INDEX IF NOT EXISTS requests_dates_idx ON requests (check_in, check_out);

-- Manual blocks the host sets from the admin page.
CREATE TABLE IF NOT EXISTS blocks (
  id             TEXT PRIMARY KEY,
  listing_slug   TEXT NOT NULL,
  check_in       DATE NOT NULL,
  check_out      DATE NOT NULL,
  reason         TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS blocks_slug_idx ON blocks (listing_slug);

-- Simple JSON key-value for admin-editable settings (rates, cleaning fee,
-- policies, iCal URLs, Stripe mode).
CREATE TABLE IF NOT EXISTS settings (
  key    TEXT PRIMARY KEY,
  value  JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Backfill columns added after the initial deploy (safe to run repeatedly).
ALTER TABLE requests ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS stripe_payment_url TEXT;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
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
  stripe_session_id: string | null;
  stripe_payment_url: string | null;
  paid_at: string | null;
};

export type Block = {
  id: string;
  listing_slug: string;
  check_in: string;
  check_out: string;
  reason: string | null;
  created_at: string;
};

let schemaReady: Promise<void> | null = null;
export function ensureSchema(): Promise<void> {
  if (!dbConfigured()) return Promise.resolve();
  if (!schemaReady) {
    const sql = client();
    schemaReady = (async () => {
      for (const stmt of SCHEMA_SQL.split(";").map((s) => s.trim()).filter(Boolean)) {
        await sql.query(stmt);
      }
    })();
  }
  return schemaReady;
}

// --- requests ---------------------------------------------------------------

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

export async function getRequest(id: string): Promise<BookingRequest | null> {
  await ensureSchema();
  const sql = client();
  const rows = (await sql`SELECT * FROM requests WHERE id = ${id}`) as unknown as BookingRequest[];
  return rows[0] ?? null;
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

export async function setStripeSession(
  id: string,
  sessionId: string,
  url: string,
) {
  await ensureSchema();
  const sql = client();
  await sql`
    UPDATE requests
       SET stripe_session_id = ${sessionId},
           stripe_payment_url = ${url}
     WHERE id = ${id}
  `;
}

export async function markPaid(id: string) {
  await ensureSchema();
  const sql = client();
  await sql`
    UPDATE requests
       SET status = 'paid',
           paid_at = NOW()
     WHERE id = ${id}
  `;
}

// --- availability -----------------------------------------------------------

/**
 * Dates to block in the UI calendar: approved/paid requests + manual host
 * blocks. The 'blocks' slug rule still applies (Combined blocks Lower + Main
 * and vice versa).
 */
export async function blockedRanges(slug: string): Promise<
  Array<{ check_in: string; check_out: string; kind: "request" | "block" }>
> {
  await ensureSchema();
  const sql = client();
  const slugs =
    slug === "combined" ? ["combined", "lower", "main"] : [slug, "combined"];
  const req = (await sql`
    SELECT check_in, check_out
      FROM requests
     WHERE status IN ('approved','paid')
       AND listing_slug = ANY(${slugs})
  `) as unknown as Array<{ check_in: string; check_out: string }>;
  const blk = (await sql`
    SELECT check_in, check_out
      FROM blocks
     WHERE listing_slug = ANY(${slugs})
  `) as unknown as Array<{ check_in: string; check_out: string }>;
  return [
    ...req.map((r) => ({ ...r, kind: "request" as const })),
    ...blk.map((r) => ({ ...r, kind: "block" as const })),
  ];
}

// --- manual blocks ----------------------------------------------------------

export async function listBlocks(): Promise<Block[]> {
  await ensureSchema();
  const sql = client();
  const rows = (await sql`
    SELECT * FROM blocks ORDER BY check_in ASC
  `) as unknown as Block[];
  return rows;
}

export async function insertBlock(b: {
  id: string;
  listing_slug: string;
  check_in: string;
  check_out: string;
  reason: string;
}) {
  await ensureSchema();
  const sql = client();
  await sql`
    INSERT INTO blocks (id, listing_slug, check_in, check_out, reason)
    VALUES (${b.id}, ${b.listing_slug}, ${b.check_in}, ${b.check_out}, ${b.reason})
  `;
}

export async function deleteBlock(id: string) {
  await ensureSchema();
  const sql = client();
  await sql`DELETE FROM blocks WHERE id = ${id}`;
}

// --- settings ---------------------------------------------------------------

export async function getSettings(): Promise<Record<string, unknown>> {
  await ensureSchema();
  const sql = client();
  const rows = (await sql`
    SELECT key, value FROM settings
  `) as unknown as Array<{ key: string; value: unknown }>;
  const out: Record<string, unknown> = {};
  for (const r of rows) out[r.key] = r.value;
  return out;
}

export async function setSetting(key: string, value: unknown) {
  await ensureSchema();
  const sql = client();
  await sql`
    INSERT INTO settings (key, value, updated_at)
    VALUES (${key}, ${JSON.stringify(value)}::jsonb, NOW())
    ON CONFLICT (key) DO UPDATE
      SET value = EXCLUDED.value, updated_at = NOW()
  `;
}
