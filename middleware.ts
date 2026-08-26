import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";
import { ATTR_COOKIE_FIRST, ATTR_COOKIE_LAST, sourceFromReferrer, type Touch } from "@/lib/attribution";

const ATTR_COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 90; // 90 days

/**
 * Server-side mirror of src/lib/attribution.ts's client-side capture, as a
 * fallback for browsers that restrict localStorage — chiefly Instagram/
 * Facebook's in-app WebView, the dominant click path for this site's Meta
 * ad traffic. Runs on every page request; app/api/checkout/route.ts reads
 * these cookies when the client didn't send its own richer payload.
 */
function captureAttribution(req: NextRequest, res: NextResponse) {
  const url = req.nextUrl;
  const utmSource = url.searchParams.get("utm_source");
  const gclid = url.searchParams.get("gclid");
  const fbclid = url.searchParams.get("fbclid");

  let referrerHost: string | null = null;
  const referer = req.headers.get("referer");
  if (referer) {
    try {
      const host = new URL(referer).hostname;
      if (host && host !== url.hostname) referrerHost = host;
    } catch {
      // malformed Referer header — treat as absent
    }
  }

  const hasCampaign = Boolean(utmSource || gclid || fbclid);
  const hasSignal = hasCampaign || Boolean(referrerHost);
  const alreadyFirst = req.cookies.get(ATTR_COOKIE_FIRST)?.value;

  // A signal-less request is only worth recording as "direct" when we know
  // nothing yet; it must never overwrite a real source on a revisit.
  if (!hasSignal && alreadyFirst) return;

  const source = utmSource
    ? utmSource.toLowerCase()
    : gclid
      ? "google"
      : fbclid
        ? "facebook"
        : referrerHost
          ? sourceFromReferrer(referrerHost)
          : "direct";

  const touch: Touch = {
    source,
    medium:
      url.searchParams.get("utm_medium")?.toLowerCase() ??
      (gclid ? "cpc" : fbclid ? "paid_social" : referrerHost ? "referral" : null),
    campaign: url.searchParams.get("utm_campaign"),
    term: url.searchParams.get("utm_term"),
    content: url.searchParams.get("utm_content"),
    gclid,
    fbclid,
    referrer: referer || null,
    landing_page: url.pathname + url.search,
    at: new Date().toISOString(),
  };

  const json = JSON.stringify(touch);
  const cookieOpts = { maxAge: ATTR_COOKIE_MAX_AGE_SEC, path: "/", sameSite: "lax" as const };
  if (!alreadyFirst) res.cookies.set(ATTR_COOKIE_FIRST, json, cookieOpts);
  res.cookies.set(ATTR_COOKIE_LAST, json, cookieOpts);
}

/**
 * Gate /admin behind a signed session cookie. /admin/login is the only
 * reachable page without one — it's where the cookie gets set. Every other
 * page request gets the attribution capture above.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") return NextResponse.next();
    const session = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
    if (!session) {
      const url = new URL("/admin/login", req.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  const res = NextResponse.next();
  captureAttribution(req, res);
  return res;
}

export const config = {
  // Runs on every page request except static assets and API routes — API
  // routes read the cookies this sets, they don't need to trigger a capture.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
