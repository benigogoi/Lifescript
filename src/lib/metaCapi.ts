/**
 * Mystic Digits — Meta Conversions API (server-side Purchase event).
 *
 * Complements the client-side pixel Purchase in src/lib/analytics.ts, which
 * only fires if the customer's browser executes it (ad blockers, iOS Safari
 * privacy settings, or closing the tab post-payment can all drop it — and
 * Purchase is the one event Meta's ad delivery most needs to optimize
 * toward). This sends the same event server-to-server, keyed by the same
 * order id as the client pixel's eventID, so Meta dedupes the two into one
 * conversion instead of double-counting.
 *
 * Best-effort only: a CAPI failure must never affect checkout, matching how
 * confirmation emails are handled in the verify/webhook routes.
 */
import "server-only";
import crypto from "node:crypto";
import type { Order } from "./orders";

const API_VERSION = "v21.0";

function hashSha256(value: string): string {
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

/** Meta's fbc format: fb.<subdomainIndex>.<creationTimeMs>.<fbclid>. */
function fbcFromClid(fbclid: string, atIso: string | undefined): string {
  const ts = (atIso && Date.parse(atIso)) || Date.now();
  return `fb.1.${ts}.${fbclid}`;
}

interface RequestContext {
  /** Customer's IP/UA, when this is invoked from a browser-originated request
   * (the Razorpay webhook has no customer context, so omit there). */
  ip?: string | null;
  userAgent?: string | null;
}

/**
 * Send a Purchase event for a newly-paid order. No-ops silently if
 * NEXT_PUBLIC_META_PIXEL_ID or META_CAPI_ACCESS_TOKEN isn't configured, so
 * this is safe to call unconditionally.
 */
export async function sendMetaPurchaseEvent(order: Order, ctx: RequestContext = {}): Promise<void> {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  if (!pixelId || !accessToken) return;

  const lastTouch = (order.attribution as { last_touch?: { fbclid?: string | null; at?: string } } | null)
    ?.last_touch;
  const fbc = lastTouch?.fbclid ? fbcFromClid(lastTouch.fbclid, lastTouch.at) : undefined;

  const userData: Record<string, unknown> = {
    em: [hashSha256(order.email)],
  };
  if (fbc) userData.fbc = fbc;
  if (ctx.ip) userData.client_ip_address = ctx.ip;
  if (ctx.userAgent) userData.client_user_agent = ctx.userAgent;

  const body = {
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        event_id: order.id,
        action_source: "website",
        event_source_url: "https://mysticdigits.in/order",
        user_data: userData,
        custom_data: {
          currency: "INR",
          value: order.amount_inr,
        },
      },
    ],
    access_token: accessToken,
  };

  const res = await fetch(`https://graph.facebook.com/${API_VERSION}/${pixelId}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Meta CAPI ${res.status}: ${text}`);
  }
}
