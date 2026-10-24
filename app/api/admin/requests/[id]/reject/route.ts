import { NextRequest, NextResponse } from "next/server";
import { getRequest, setStatus } from "@/lib/db";
import { emailGuestRejected } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  try {
    await setStatus(id, "rejected");
    const r = await getRequest(id);
    if (r) await emailGuestRejected(r);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return new NextResponse((err as Error).message, { status: 500 });
  }
}
