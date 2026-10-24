// Resolves live settings (rate overrides, policy overrides) on top of the
// defaults in listings.ts. All server-side.

import { getSettings, dbConfigured } from "./db";
import {
  LISTINGS,
  POLICIES,
  type Listing,
  listingOverrides,
} from "./listings";

type RateOverrides = Partial<Record<Listing["slug"], number>>;
type PolicyOverrides = Partial<{
  cleaningFee: number;
  petFee: number;
  minimumNights: number;
  approvalWindowHours: number;
  taxRate: number;
}>;

export type ResolvedConfig = {
  listings: Listing[];
  policies: typeof POLICIES;
  rates: RateOverrides;
  rawPolicyOverrides: PolicyOverrides;
};

export async function resolveConfig(): Promise<ResolvedConfig> {
  let rates: RateOverrides = {};
  let polOverrides: PolicyOverrides = {};
  if (dbConfigured()) {
    try {
      const s = await getSettings();
      if (s.rates && typeof s.rates === "object") {
        rates = s.rates as RateOverrides;
      }
      if (s.policies && typeof s.policies === "object") {
        polOverrides = s.policies as PolicyOverrides;
      }
    } catch {
      // Settings table may not exist yet; fall through to defaults.
    }
  }

  const listings = LISTINGS.map((l) =>
    listingOverrides(l, { nightly: rates[l.slug] ?? l.nightly }),
  );
  const policies = { ...POLICIES, ...polOverrides } as typeof POLICIES;
  return { listings, policies, rates, rawPolicyOverrides: polOverrides };
}

export async function resolveListing(
  slug: string,
): Promise<{ listing: Listing | undefined; policies: typeof POLICIES }> {
  const cfg = await resolveConfig();
  return {
    listing: cfg.listings.find((l) => l.slug === slug),
    policies: cfg.policies,
  };
}
