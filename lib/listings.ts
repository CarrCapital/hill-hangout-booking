// Default rates, policies and listing content. Any field here can be
// overridden at runtime through the admin UI (writes to the `settings` and
// `rates` tables). Edit this file for the fallback / seed values only.

export type Listing = {
  slug: "lower" | "main" | "combined";
  name: string;
  shortName: string;
  blurb: string;
  shortDescription: string;
  longDescription: string;
  loveReasons: string[];
  nightly: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  beds: string;
  heroPhoto: string;
  photos: string[];
  amenities: string[];
  airbnbId: string;
  // Combined blocks lower + main (and vice versa). Listed by slug.
  blocks: Array<"lower" | "main" | "combined">;
};

const COMMON_AMENITIES = [
  "Fast Wi-Fi",
  "Fully equipped kitchen",
  "Coffee bar",
  "Dedicated workspace",
  "Washer and dryer in unit",
  "Smart TV",
  "Keyless entry",
  "Fresh linens and plush bedding",
  "Blackout curtains",
  "Air conditioning and heat",
  "Shared rooftop with hot tub, grill, outdoor dining, projector screen (7 AM to 11 PM)",
  "Capitol dome views from the rooftop",
  "Free street parking; on-site parking $20/night ($30/night with 50-amp EV plug)",
  "Pets allowed with approval (max 2, $100 per stay)",
];

const COMMON_LOVE = [
  "Rooftop hangout with hot tub and direct Capitol dome views",
  "Two blocks to NoMa Metro — car-free DC made easy",
  "Great photo spots: rooftop, murals, photo wall and more",
  "Michelin-starred restaurants within a few blocks",
  "Minutes from the Capitol and DC's best attractions",
];

// Airbnb hosts the photos the user already uploaded to each listing. We load
// them directly from Airbnb's CDN for now. If any image URL ever breaks (Airbnb
// re-hashes it, or hot-linking stops working), drop in local photos under
// /public/photos/ and swap the paths in this file.
const PH_COMBINED = [
  "https://a0.muscache.com/im/pictures/hosting/Hosting-1724929036749618384/original/ae34abbd-5127-4215-9270-b87891f703a4.jpeg?im_w=1440",
  "https://a0.muscache.com/im/pictures/hosting/Hosting-1724929036749618384/original/4483b28d-7bf7-46f4-9703-9c0cab2e7922.jpeg?im_w=1200",
  "https://a0.muscache.com/im/pictures/hosting/Hosting-1724929036749618384/original/cb5db920-28e7-4c11-a3df-4ab69642a8c9.jpeg?im_w=1200",
  "https://a0.muscache.com/im/pictures/hosting/Hosting-1724929036749618384/original/788dfed4-3d44-4d76-8e1e-af3325271628.jpeg?im_w=1200",
  "https://a0.muscache.com/im/pictures/hosting/Hosting-1724929036749618384/original/badd8342-d69b-4fd1-bfae-af0c7175cfe4.jpeg?im_w=1200",
  "https://a0.muscache.com/im/pictures/hosting/Hosting-1724929036749618384/original/b717b698-eb85-444b-b696-3752c3160340.jpeg?im_w=1200",
  "https://a0.muscache.com/im/pictures/hosting/Hosting-1724929036749618384/original/50cdea46-7f8e-49da-8929-7d2751b6ec10.jpeg?im_w=1200",
  "https://a0.muscache.com/im/pictures/hosting/Hosting-1724929036749618384/original/d75422fe-46ba-4201-a9cb-33d829232c9e.jpeg?im_w=1200",
  "https://a0.muscache.com/im/pictures/hosting/Hosting-1724929036749618384/original/f96039c0-deb2-4a35-81e2-41c63e296e75.jpeg?im_w=1200",
];

const PH_MAIN = [
  "https://a0.muscache.com/im/pictures/hosting/Hosting-1717781764050847554/original/37b65ccc-4fdd-4178-821a-dfe2fb9f3d0f.jpeg?im_w=1440",
  "https://a0.muscache.com/im/pictures/hosting/Hosting-1717781764050847554/original/382bb97e-9596-4fbb-89d5-aa0dfcf5d9e4.jpeg?im_w=1200",
  "https://a0.muscache.com/im/pictures/hosting/Hosting-1717781764050847554/original/c87ddc1a-9da4-4721-896b-c52b6cef2c5e.jpeg?im_w=1200",
  "https://a0.muscache.com/im/pictures/hosting/Hosting-1717781764050847554/original/7d55f36e-130e-496c-a531-6462aef36bc0.jpeg?im_w=1200",
  "https://a0.muscache.com/im/pictures/hosting/Hosting-1717781764050847554/original/47f51d9a-586e-4ee8-8dfd-3dfdbc61d9ae.jpeg?im_w=1200",
  "https://a0.muscache.com/im/pictures/hosting/Hosting-1717781764050847554/original/c6452961-0e73-4149-a14b-258e9803dbcc.jpeg?im_w=1200",
];

const PH_LOWER = [
  "https://a0.muscache.com/im/pictures/hosting/Hosting-1717803178849475650/original/2b252a08-21fe-4599-b5b9-875b3592e9e7.jpeg?im_w=1440",
  "https://a0.muscache.com/im/pictures/hosting/Hosting-1717803178849475650/original/01090883-e5ee-4b79-b071-b2a5ba2e1237.jpeg?im_w=1200",
  "https://a0.muscache.com/im/pictures/hosting/Hosting-1717803178849475650/original/f4110311-53e0-43c3-af6e-319b7fdcc6de.jpeg?im_w=1200",
  "https://a0.muscache.com/im/pictures/hosting/Hosting-1717803178849475650/original/471f8c77-371e-4007-94f1-007203d48723.jpeg?im_w=1200",
  "https://a0.muscache.com/im/pictures/hosting/Hosting-1717803178849475650/original/8089d47b-d89e-40cd-bc91-a0c5f642a3ba.jpeg?im_w=1200",
  "https://a0.muscache.com/im/pictures/hosting/Hosting-1717803178849475650/original/384297a1-031f-4a3b-a420-5388aad1c710.jpeg?im_w=1200",
  "https://a0.muscache.com/im/pictures/hosting/Hosting-1717803178849475650/original/9584688c-71d0-4888-81b5-ff03e642a5bc.jpeg?im_w=1200",
];

const SHARED_INTRO = `
Welcome to this beautifully renovated home away from home at Hill Hangout. The
rooms are spacious, the furnishings refined, and the kitchen fully equipped for
anything from a quick coffee to a home-cooked feast. Sink into plush pillows
and premium bedding after a day of exploring, and enjoy spaces curated for
short-term stays and real comfort.
`.trim();

const ROOFTOP_PARAGRAPH = `
The showstopper is the rooftop. Soak in the hot tub under the stars, take in
the Capitol dome, dine outside, grill, or put on an evening movie on the
projector screen with friends or family. Shared access 7 AM to 11 PM.
`.trim();

const LOCATION_PARAGRAPH = `
In the NoMa neighborhood, adjacent to Union Market and a few blocks from the
H Street Corridor. Known for excellent restaurants, coffee shops, nightlife
and easy downtown access. Two blocks to the NoMa-Gallaudet U Metro (Red Line),
five minutes to Union Market, ten to H Street, and a short Metro ride to the
Capitol, Union Station and the National Mall.
`.trim();

const GETTING_THERE = `
Getting there:
• Reagan National (DCA): 15-25 min by car, 35-45 by Metro. Recommended.
• Dulles (IAD): 45-60 min by car, about 1h 15 by Metro.
• BWI: 45-60 min by car, about 1 hour by MARC/Amtrak.
`.trim();

const PARKING = `
Free street parking is included. On-site parking is $20/night on request. An
EV spot with a 50-amp plug is $30/night.
`.trim();

export const LISTINGS: Listing[] = [
  {
    slug: "lower",
    name: "Hill Hangout Lower Level Suite",
    shortName: "Lower Level",
    blurb: "Two-bedroom lower suite with its own entrance.",
    shortDescription:
      "Spacious two-bedroom suite with a private street entrance. King + queen bedrooms, plus a queen pull-out sofa, so it sleeps up to six. Full kitchen, two bathrooms, quiet and dim for sleeping in. Shared access to the rooftop hot tub and Capitol dome views.",
    longDescription: [
      SHARED_INTRO,
      ROOFTOP_PARAGRAPH,
      "Your lower-level suite includes:",
      "• Bedroom 1 — Plush KING bed with private en-suite bathroom",
      "• Bedroom 2 — Cozy QUEEN bed with full hallway bathroom",
      "• Living Room — Pull-out sofa bed for extra guests",
      "• Fully Equipped Kitchen — Everything you need for a full meal or morning coffee",
      LOCATION_PARAGRAPH,
      GETTING_THERE,
      PARKING,
    ].join("\n\n"),
    loveReasons: [
      ...COMMON_LOVE,
      "Spacious newly renovated 1,300+ sq ft — sleeps 6",
    ],
    nightly: 250,
    maxGuests: 6,
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1300,
    beds: "1 king, 1 queen, 1 queen sofa bed",
    heroPhoto: PH_LOWER[0],
    airbnbId: "1717803178849475650",
    photos: PH_LOWER,
    amenities: COMMON_AMENITIES,
    blocks: ["combined"],
  },
  {
    slug: "main",
    name: "Hill Hangout Main Level Suite",
    shortName: "Main Level",
    blurb: "Light-filled mid-level suite with direct rooftop access.",
    shortDescription:
      "Renovated open-concept one-bedroom with full kitchen and the main access to the shared rooftop. King bed with en-suite bath, queen sofa bed and queen air mattress in the living room so it sleeps up to six. About 1,300 sq ft.",
    longDescription: [
      SHARED_INTRO,
      ROOFTOP_PARAGRAPH,
      "Your mid-level suite includes:",
      "• Bedroom — Plush KING bed",
      "• Living Room — Pull-out sofa + queen air mattress for extra guests",
      "• Full Bathroom — Modern walk-in shower, essentials provided",
      "• Fully Equipped Kitchen — Everything you need for a full meal or morning coffee",
      LOCATION_PARAGRAPH,
      GETTING_THERE,
      PARKING,
    ].join("\n\n"),
    loveReasons: [
      ...COMMON_LOVE,
      "Spacious newly renovated 1,300+ sq ft — sleeps 6",
    ],
    nightly: 250,
    maxGuests: 6,
    bedrooms: 1,
    bathrooms: 1,
    sqft: 1300,
    beds: "1 king, 1 queen sofa bed, 1 queen air mattress",
    heroPhoto: PH_MAIN[0],
    airbnbId: "1717781764050847554",
    photos: PH_MAIN,
    amenities: COMMON_AMENITIES,
    blocks: ["combined"],
  },
  {
    slug: "combined",
    name: "Hill Hangout Combined Suite",
    shortName: "Combined Suite",
    blurb: "The whole house, both floors, up to twelve.",
    shortDescription:
      "A huge 2,600+ sq ft newly renovated dual-suite retreat that sleeps up to 12. Two private apartments booked together: 3 bedrooms with TWO KING beds and a QUEEN, 3 baths, 2 full kitchens, two living areas with pull-out sofas, plus a queen air mattress. The best part: a large shared rooftop with hot tub, grill, evening movie screen, outdoor dining, and stunning U.S. Capitol views.",
    longDescription: [
      "Escape to Hill Hangout: a huge 2,600+ sq ft newly renovated dual-suite retreat that sleeps up to 12. Two private apartments, booked together — 3 bedrooms with TWO KING beds and a QUEEN, 3 baths, 2 full kitchens, two living areas with pull-out sofas, plus a queen air mattress.",
      SHARED_INTRO,
      ROOFTOP_PARAGRAPH,
      "Your mid-level suite includes:",
      "• Bedroom — Plush KING bed",
      "• Living Room — Pull-out sofa + queen air mattress for extra guests",
      "• Full Bathroom — Modern walk-in shower, essentials provided",
      "• Fully Equipped Kitchen — Everything you need for a full meal or morning coffee",
      "Your lower-level suite includes:",
      "• Bedroom 1 — Plush KING bed with private en-suite bathroom",
      "• Bedroom 2 — Cozy QUEEN bed with full hallway bathroom",
      "• Living Room — Pull-out sofa bed for extra guests",
      "• Fully Equipped Kitchen — Everything you need for a full meal or morning coffee",
      LOCATION_PARAGRAPH,
      "Nearby:",
      "• Union Market (5-min walk)",
      "• H Street Corridor (10-min walk)",
      "• Union Station (1 metro stop)",
      "• U.S. Capitol (1 metro stop)",
      "• National Mall and Smithsonian Museums (3 metro stops)",
      "• United States National Arboretum",
      GETTING_THERE,
      PARKING,
    ].join("\n\n"),
    loveReasons: [
      ...COMMON_LOVE,
      "Whole-house privacy for up to 12 — reunions, retreats, wedding blocks",
    ],
    nightly: 600,
    maxGuests: 12,
    bedrooms: 3,
    bathrooms: 3,
    sqft: 2600,
    beds: "2 king, 1 queen, 2 queen sofa beds, 1 queen air mattress",
    heroPhoto: PH_COMBINED[0],
    airbnbId: "1724929036749618384",
    photos: PH_COMBINED,
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
  // The home is in NoMa, Washington DC. Exact street address is shown to the
  // guest only after their booking is paid. The map pin is an approximate
  // area, not the address.
  neighborhood: "NoMa, Washington DC",
  approxLat: 38.9065,
  approxLng: -77.0033,
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
    tagline: "A renovated rowhouse in NoMa, Washington DC.",
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
