import { Listing, POLICIES } from "./listings";

export type Quote = {
  nights: number;
  nightly: number;
  subtotal: number;
  cleaningFee: number;
  petFee: number;
  tax: number;
  total: number;
};

type PricingPolicies = {
  cleaningFee: number;
  petFee: number;
  taxRate: number;
};

export function nightsBetween(checkIn: string, checkOut: string): number {
  const a = new Date(checkIn + "T00:00:00");
  const b = new Date(checkOut + "T00:00:00");
  const ms = b.getTime() - a.getTime();
  return Math.max(0, Math.round(ms / 86400000));
}

export function quote(
  listing: Listing,
  checkIn: string,
  checkOut: string,
  bringingPet: boolean,
  policies: PricingPolicies = POLICIES,
): Quote {
  const nights = nightsBetween(checkIn, checkOut);
  const subtotal = nights * listing.nightly;
  const cleaningFee = nights > 0 ? policies.cleaningFee : 0;
  const petFee = bringingPet && nights > 0 ? policies.petFee : 0;
  const taxable = subtotal + cleaningFee + petFee;
  const tax = Math.round(taxable * policies.taxRate * 100) / 100;
  const total = Math.round((taxable + tax) * 100) / 100;
  return {
    nights,
    nightly: listing.nightly,
    subtotal,
    cleaningFee,
    petFee,
    tax,
    total,
  };
}

export function formatMoney(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}
