import { NextRequest, NextResponse } from "next/server";

// Gate the /admin page with the same basic-auth check used for the admin API
// routes. Pulled into middleware so unauthenticated requests never load the
// page HTML.
const USER = "admin";

export function middleware(req: NextRequest) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return new NextResponse(
      "ADMIN_PASSWORD is not set. Add it in Vercel project settings.",
      { status: 503 },
    );
  }
  const header = req.headers.get("authorization") || "";
  if (header.startsWith("Basic ")) {
    const [, b64] = header.split(" ");
    const decoded = Buffer.from(b64, "base64").toString("utf8");
    const idx = decoded.indexOf(":");
    if (idx > 0) {
      const user = decoded.slice(0, idx);
      const pass = decoded.slice(idx + 1);
      if (user === USER && pass === expected) {
        return NextResponse.next();
      }
    }
  }
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Hill Hangout admin"' },
  });
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
