import { NextRequest, NextResponse } from "next/server";
import { deleteBlock } from "@/lib/db";

export const runtime = "nodejs";

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  try {
    await deleteBlock(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return new NextResponse((err as Error).message, { status: 500 });
  }
}
