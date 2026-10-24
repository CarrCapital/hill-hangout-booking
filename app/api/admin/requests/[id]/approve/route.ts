import { NextRequest, NextResponse } from "next/server";
import { setStatus } from "@/lib/db";
import { createCheckoutForRequest, stripeConfigured } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  try {
    await setStatus(id, "approved");
    let paymentUrl: string | null = null;
    if (stripeConfigured()) {
      const host = req.headers.get("host");
      const proto = req.headers.get("x-forwarded-proto");
      const session = await createCheckoutForRequest(id, host, proto);
      paymentUrl = session?.url ?? null;
    }
    // TODO: email guest with the payment link once Resend is wired.
    return NextResponse.json({ ok: true, paymentUrl });
  } catch (err) {
    return new NextResponse((err as Error).message, { status: 500 });
  }
}
