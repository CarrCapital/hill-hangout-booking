import { NextResponse } from "next/server";
import { blockedRanges, dbConfigured } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Returns blocked ranges per listing (approved/paid requests + manual blocks)
// taking cascading blocks into account (Combined ↔ Lower/Main).
export async function GET() {
  if (!dbConfigured()) {
    return NextResponse.json({
      lower: [],
      main: [],
      combined: [],
      dbConfigured: false,
    });
  }
  const [lower, main, combined] = await Promise.all([
    blockedRanges("lower").catch(() => []),
    blockedRanges("main").catch(() => []),
    blockedRanges("combined").catch(() => []),
  ]);
  return NextResponse.json({
    lower,
    main,
    combined,
    dbConfigured: true,
  });
}
