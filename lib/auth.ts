// Admin uses HTTP Basic auth against ADMIN_PASSWORD. Simple, no sessions, no
// third-party dependency. Swap for a real auth provider if the admin page
// grows beyond Josh.

import { NextRequest, NextResponse } from "next/server";

const USER = "admin";

export function checkBasicAuth(req: NextRequest): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const header = req.headers.get("authorization") || "";
  if (!header.startsWith("Basic ")) return false;
  const [, b64] = header.split(" ");
  const decoded = Buffer.from(b64, "base64").toString("utf8");
  const idx = decoded.indexOf(":");
  if (idx < 0) return false;
  const user = decoded.slice(0, idx);
  const pass = decoded.slice(idx + 1);
  return user === USER && pass === expected;
}

export function challenge(): NextResponse {
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Hill Hangout admin"' },
  });
}
