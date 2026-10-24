import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { insertBlock } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    listing_slug?: string;
    check_in?: string;
    check_out?: string;
    reason?: string;
  };
  if (!body.listing_slug || !body.check_in || !body.check_out) {
    return new NextResponse("Missing fields.", { status: 400 });
  }
  if (!["lower", "main", "combined"].includes(body.listing_slug)) {
    return new NextResponse("Unknown listing.", { status: 400 });
  }
  if (body.check_out <= body.check_in) {
    return new NextResponse("Checkout must be after check-in.", { status: 400 });
  }
  try {
    await insertBlock({
      id: randomUUID(),
      listing_slug: body.listing_slug,
      check_in: body.check_in,
      check_out: body.check_out,
      reason: (body.reason ?? "").trim(),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return new NextResponse((err as Error).message, { status: 500 });
  }
}
