import { NextRequest, NextResponse } from "next/server";
import { setStatus } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  try {
    await setStatus(id, "rejected");
    // TODO: send guest a short "not this time" email via Resend.
    return NextResponse.json({ ok: true });
  } catch (err) {
    return new NextResponse((err as Error).message, { status: 500 });
  }
}
