import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import {
  getListing,
  POLICIES,
} from "@/lib/listings";
import { quote, nightsBetween } from "@/lib/pricing";
import { blockedRanges, dbConfigured, insertRequest } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  listing_slug?: string;
  check_in?: string;
  check_out?: string;
  guests?: number;
  bringing_pet?: boolean;
  name?: string;
  email?: string;
  phone?: string;
  purpose?: string;
};

function isDateStr(s: unknown): s is string {
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const listing = body.listing_slug ? getListing(body.listing_slug) : undefined;
  if (!listing) {
    return NextResponse.json({ error: "Unknown listing." }, { status: 400 });
  }
  if (!isDateStr(body.check_in) || !isDateStr(body.check_out)) {
    return NextResponse.json(
      { error: "Dates must be YYYY-MM-DD." },
      { status: 400 },
    );
  }
  const nights = nightsBetween(body.check_in, body.check_out);
  if (nights < POLICIES.minimumNights) {
    return NextResponse.json(
      { error: `Minimum stay is ${POLICIES.minimumNights} nights.` },
      { status: 400 },
    );
  }
  const guests = Number(body.guests);
  if (!Number.isInteger(guests) || guests < 1 || guests > listing.maxGuests) {
    return NextResponse.json(
      { error: `Guests must be between 1 and ${listing.maxGuests}.` },
      { status: 400 },
    );
  }
  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  const phone = (body.phone ?? "").trim();
  if (!name || !email || !phone) {
    return NextResponse.json(
      { error: "Name, email and phone are required." },
      { status: 400 },
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Email looks wrong." },
      { status: 400 },
    );
  }

  // Check availability (approved + paid). Pending requests don't hold dates;
  // that way guests can send a request even if someone else has one in flight.
  if (dbConfigured()) {
    try {
      const blocked = await blockedRanges(listing.slug);
      const overlap = blocked.some(
        (r) => body.check_in! < r.check_out && body.check_out! > r.check_in,
      );
      if (overlap) {
        return NextResponse.json(
          { error: "Those dates are already booked." },
          { status: 409 },
        );
      }
    } catch (err) {
      // Fall through: don't block the request on a DB read error, but log it.
      console.error("availability check failed", err);
    }
  }

  const q = quote(listing, body.check_in, body.check_out, !!body.bringing_pet);
  const id = randomUUID();

  if (dbConfigured()) {
    try {
      await insertRequest({
        id,
        listing_slug: listing.slug,
        check_in: body.check_in,
        check_out: body.check_out,
        guests,
        bringing_pet: !!body.bringing_pet,
        name,
        email,
        phone,
        purpose: (body.purpose ?? "").trim(),
        nightly: q.nightly,
        subtotal: q.subtotal,
        cleaning_fee: q.cleaningFee,
        pet_fee: q.petFee,
        tax: q.tax,
        total: q.total,
      });
    } catch (err) {
      console.error("insert failed", err);
      return NextResponse.json(
        { error: "Could not save request. Please try again." },
        { status: 500 },
      );
    }
  } else {
    console.log("Booking request (DB not configured):", {
      id,
      listing: listing.slug,
      ...body,
      total: q.total,
    });
  }

  // Email notifications land here once RESEND_API_KEY is set. Left as a stub
  // so that nothing breaks when the key isn't present yet.
  // TODO: send email to guest + NOTIFICATION_EMAIL via Resend.

  return NextResponse.json({ id, total: q.total });
}
