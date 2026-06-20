import { NextResponse, type NextRequest } from "next/server";

/**
 * Gate /admin behind HTTP Basic Auth. Username is fixed ("admin"); password
 * comes from ADMIN_PASSWORD. Simple but sufficient for a solo-operator panel
 * that only views orders and triggers send/hold actions.
 */
export function middleware(req: NextRequest) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    // Fail closed: an unconfigured admin panel must not be reachable.
    return new NextResponse("Admin panel not configured.", { status: 503 });
  }

  const auth = req.headers.get("authorization");
  const expected = "Basic " + Buffer.from(`admin:${password}`).toString("base64");
  if (auth === expected) {
    return NextResponse.next();
  }

  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="LifeScript Admin"' },
  });
}

export const config = {
  matcher: ["/admin/:path*"],
};
