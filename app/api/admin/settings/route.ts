import { NextRequest, NextResponse } from "next/server";
import { setSetting } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    rates?: Record<string, number>;
    policies?: Record<string, number>;
  };
  try {
    if (body.rates) await setSetting("rates", body.rates);
    if (body.policies) await setSetting("policies", body.policies);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return new NextResponse((err as Error).message, { status: 500 });
  }
}
