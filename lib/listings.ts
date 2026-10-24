// Default rates, policies and listing content. Any field here can be
// overridden at runtime through the admin UI (writes to the `settings` and
// `rates` tables). Edit this file for the fallback / seed values only.

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
  sqft: number;
  beds: string;
  heroPhoto: string;
  photos: string[];
  amenities: string[];
  airbnbId?: string;
  // Combined blocks lower + main (and vice versa). Listed by slug.
  blocks: Array<"lower" | "main" | "combined">;
};

const COMMON_AMENITIES = [
  "Fast Wi-Fi",
  "Fully equipped kitchen",
  "Dedicated workspace",
  "Washer and dryer in unit",
  "Smart TV",
  "Keyless entry",
  "Shared rooftop with hot tub, grill, outdoor dining, projector screen (7am-11pm)",
  "Capitol dome views from the rooftop",
  "Free street parking; on-site parking $20/night ($30/night with 50-amp EV plug)",
  "Fresh linens and plush bedding",
  "Air conditioning and heat",
  "Pets allowed with approval (max 2, $100 per stay)",
];

const SHARED_DESCRIPTION = `
Hill Hangout is a renovated 1920s rowhouse in NoMa, split into two separate
suites that can be rented alone or together. Shared rooftop with a hot tub,
grill, outdoor dining and a Capitol dome view. Five minutes on foot to the
NoMa-Gallaudet Red Line. Union Market around the corner, H Street a short
walk up, Capitol Hill and the National Mall close by.
`.trim();

export const LISTINGS: Listing[] = [
  {
    slug: "lower",
    name: "Hill Hangout Lower Level Suite",
    shortName: "Lower Level",
    blurb: "Two-bedroom lower suite with its own entrance.",
    description:
      SHARED_DESCRIPTION +
      " " +
      "The downstairs home: a renovated two-bedroom suite with its own street entrance. King bed in the primary with en-suite bath, queen in the second bedroom with hallway bath, plus a queen sofa bed in the living room. Full kitchen, dedicated workspace, quiet and dim for sleeping in. About 1,300 sq ft. Rooftop access is shared with the main level, 7am to 11pm.",
    nightly: 250,
    maxGuests: 6,
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1300,
    beds: "1 king, 1 queen, 1 queen sofa bed",
    heroPhoto: "/photos/hero-1.jpg",
    airbnbId: "1717803178849475650",
    photos: [
      "/photos/hero-1.jpg",
      "/photos/bedroom-1.jpg",
      "/photos/living-1.jpg",
      "/photos/kitchen-1.jpg",
      "/photos/bath-1.jpg",
      "/photos/rooftop-1.jpg",
    ],
    amenities: COMMON_AMENITIES,
    blocks: ["combined"],
  },
  {
    slug: "main",
    name: "Hill Hangout Main Level Suite",
    shortName: "Main Level",
    blurb: "Light-filled main-floor suite with direct rooftop access.",
    description:
      SHARED_DESCRIPTION +
      " " +
      "The upstairs home. Renovated open-concept one-bedroom with full kitchen and the main access to the shared rooftop. King bed with en-suite bath, queen sofa bed and queen air mattress in the living room, so it sleeps up to six. About 1,300 sq ft. Pick this if you want the rooftop as your morning coffee spot.",
    nightly: 250,
    maxGuests: 6,
    bedrooms: 1,
    bathrooms: 1,
    sqft: 1300,
    beds: "1 king, 1 queen sofa bed, 1 queen air mattress",
    heroPhoto: "/photos/hero-3.jpg",
    airbnbId: "1717781764050847554",
    photos: [
      "/photos/hero-3.jpg",
      "/photos/hero-4.jpg",
      "/photos/rooftop-1.jpg",
      "/photos/kitchen-1.jpg",
      "/photos/bedroom-1.jpg",
      "/photos/living-1.jpg",
    ],
    amenities: COMMON_AMENITIES,
    blocks: ["combined"],
  },
  {
    slug: "combined",
    name: "Hill Hangout Combined Suite",
    shortName: "Combined Suite",
    blurb: "The whole house, both floors, up to twelve.",
    description:
      SHARED_DESCRIPTION +
      " " +
      "Both floors together for one group. Three bedrooms, three baths, two full kitchens, two living rooms, the whole rooftop. Up to twelve people once you count the sofa beds and air mattress. Right for a reunion, a wedding block, a small team retreat. About 2,600 sq ft total.",
    nightly: 600,
    maxGuests: 12,
    bedrooms: 3,
    bathrooms: 3,
    sqft: 2600,
    beds: "2 king, 1 queen, 2 queen sofa beds, 1 queen air mattress",
    heroPhoto: "/photos/hero-2.jpg",
    airbnbId: "1724929036749618384",
    photos: [
      "/photos/hero-2.jpg",
      "/photos/exterior-1.jpg",
      "/photos/rooftop-1.jpg",
      "/photos/hero-3.jpg",
      "/photos/hero-1.jpg",
      "/photos/kitchen-1.jpg",
    ],
    amenities: COMMON_AMENITIES,
    blocks: ["lower", "main"],
  },
];

export const POLICIES = {
  cleaningFee: 130,
  petFee: 100, // one-time, per stay; up to 2 pets, must be approved
  taxRate: 0.1575, // DC short-term rental, 15.75%
  minimumNights: 2,
  checkInTime: "3:00 PM",
  checkOutTime: "11:00 AM",
  approvalWindowHours: 24,
  minBookingAge: 25,
  cancellation:
    "Moderate: full refund 5+ days before check-in. 50% refund up to 1 day before. No refund within 24 hours of check-in.",
  address: "501 M Street NE, Washington DC",
  houseRules: [
    "Primary guest must be 25 or older to book.",
    "No parties or events.",
    "No smoking within 50 feet of the home ($500 penalty).",
    "Pets: up to 2 allowed with prior approval. $100 per stay, non-refundable. Share breed, age, size, and whether they'll be crated.",
    "Rooftop open 7 AM to 11 PM.",
    "Quiet hours after 10 PM out of respect for neighbors.",
  ],
  brand: {
    name: "Hill Hangout",
    tagline: "501 M Street NE, in NoMa, Washington DC.",
  },
} as const;

export function getListing(slug: string): Listing | undefined {
  return LISTINGS.find((l) => l.slug === slug);
}

export function listingOverrides(
  listing: Listing,
  overrides?: { nightly?: number },
): Listing {
  if (!overrides) return listing;
  return { ...listing, ...overrides };
}
