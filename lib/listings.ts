// Edit this file to change rates, descriptions, caps, policies or add listings.
// Any change goes live when it hits the main branch.

export type Listing = {
  slug: "lower" | "main" | "combined";
  name: string;
  shortName: string;
  blurb: string;
  description: string;
  nightly: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  heroPhoto: string;
  photos: string[];
  // Combined blocks lower + main (and vice versa). Listed by slug.
  blocks: Array<"lower" | "main" | "combined">;
};

export const LISTINGS: Listing[] = [
  {
    slug: "lower",
    name: "Hill Hangout Lower Level",
    shortName: "Lower Level",
    blurb: "Private basement suite with its own entrance.",
    description:
      "A tucked-away one-bedroom suite on the lower level with its own street entrance. Full kitchen, living room, laundry. Quiet, dim, good for a longer stay or a work trip. Shares the rooftop with the main level.",
    nightly: 250,
    maxGuests: 6,
    bedrooms: 1,
    bathrooms: 1,
    heroPhoto: "/photos/lower-hero.jpg",
    photos: ["/photos/lower-hero.jpg"],
    blocks: ["combined"],
  },
  {
    slug: "main",
    name: "Hill Hangout Main Level",
    shortName: "Main Level",
    blurb: "Light-filled main floor with the rooftop view.",
    description:
      "The upstairs home. Two bedrooms, two baths, open kitchen and living, and the main access to the rooftop. Good for a family or a couple of friends staying together.",
    nightly: 250,
    maxGuests: 6,
    bedrooms: 2,
    bathrooms: 2,
    heroPhoto: "/photos/main-hero.jpg",
    photos: ["/photos/main-hero.jpg"],
    blocks: ["combined"],
  },
  {
    slug: "combined",
    name: "Hill Hangout Combined Suite",
    shortName: "Combined Suite",
    blurb: "The whole house, both floors, up to twelve.",
    description:
      "Both floors together for one group. Three bedrooms, three baths, two kitchens, two living rooms, the rooftop. Right for a reunion, a wedding block, a small team retreat.",
    nightly: 600,
    maxGuests: 12,
    bedrooms: 3,
    bathrooms: 3,
    heroPhoto: "/photos/combined-hero.jpg",
    photos: ["/photos/combined-hero.jpg"],
    blocks: ["lower", "main"],
  },
];

export const POLICIES = {
  cleaningFee: 130,
  petFee: 100, // one-time, per stay
  taxRate: 0.1575, // DC short-term rental, 15.75%
  minimumNights: 2,
  checkInTime: "3:00 PM",
  checkOutTime: "11:00 AM",
  approvalWindowHours: 24,
  cancellation:
    "Moderate: full refund 5+ days before check-in. 50% refund up to 1 day before. No refund within 24 hours of check-in.",
  address: "501 M Street NE, Washington DC",
  brand: {
    name: "Hill Hangout",
    tagline: "501 M Street NE, in NoMa, Washington DC.",
  },
} as const;

export function getListing(slug: string): Listing | undefined {
  return LISTINGS.find((l) => l.slug === slug);
}
