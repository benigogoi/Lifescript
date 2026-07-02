/**
 * Mystic Digits — centralized client-side analytics.
 *
 * Every GA4 + Meta Pixel event goes through this module so event names,
 * ecommerce parameters, and dedup logic live in exactly one place. All
 * functions are safe to call anywhere: they no-op on the server and when
 * the underlying tag hasn't loaded (ad blockers, consent, slow network).
 *
 * Customer journey → events fired (GA4 / Meta):
 *   free preview shown   → generate_lead + view_item / Lead
 *   tapped "Get Report"  → begin_checkout            / InitiateCheckout
 *   payment verified     → purchase                  / Purchase (eventID-deduped)
 */
import { PRICE_INR } from "./order";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

/** The single product we sell, in GA4 ecommerce `items[]` shape. */
export const REPORT_ITEM = {
  item_id: "numerology-report",
  item_name: "Personalised 10-Page Numerology Report",
  price: PRICE_INR,
  quantity: 1,
} as const;

export const CURRENCY = "INR";

/** Low-level GA4 event. Prefer the named journey functions below. */
export function trackGA(eventName: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", eventName, params ?? {});
  }
}

/** Low-level Meta Pixel event. `eventId` enables Meta-side deduplication. */
export function trackMeta(event: string, params?: Record<string, unknown>, eventId?: string) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    if (eventId) {
      window.fbq("track", event, params ?? {}, { eventID: eventId });
    } else {
      window.fbq("track", event, params ?? {});
    }
  }
}

/** The free preview was shown: they gave name/DOB/email and saw the product. */
export function trackPreviewShown() {
  trackGA("generate_lead", { currency: CURRENCY, value: PRICE_INR });
  trackGA("view_item", {
    currency: CURRENCY,
    value: PRICE_INR,
    items: [REPORT_ITEM],
  });
  trackMeta("Lead");
}

/** The customer tapped "Get Full Report" — checkout is opening. */
export function trackBeginCheckout() {
  trackGA("begin_checkout", {
    currency: CURRENCY,
    value: PRICE_INR,
    items: [REPORT_ITEM],
  });
  trackMeta("InitiateCheckout", { value: PRICE_INR, currency: CURRENCY });
}

const PURCHASE_GUARD_PREFIX = "md_purchase_tracked:";

/**
 * Fire the purchase conversion exactly once per order.
 *
 * Called from the thank-you page only when it carries a real order id (which
 * the page only gets after /api/checkout/verify confirmed the Razorpay
 * signature, marked the order paid, and kicked off report generation).
 * A localStorage guard keyed by order id makes refreshes/revisits no-ops,
 * and the same id doubles as Meta's eventID for server-side dedup.
 *
 * Returns true if the event was sent, false if it was already tracked.
 */
export function trackPurchase(orderId: string): boolean {
  if (typeof window === "undefined" || !orderId) return false;

  const guardKey = `${PURCHASE_GUARD_PREFIX}${orderId}`;
  try {
    if (window.localStorage.getItem(guardKey)) return false;
    window.localStorage.setItem(guardKey, new Date().toISOString());
  } catch {
    // Storage unavailable (private mode etc.) — still track; worst case a
    // manual refresh double-counts, which beats losing the conversion.
  }

  trackGA("purchase", {
    transaction_id: orderId,
    currency: CURRENCY,
    value: PRICE_INR,
    items: [REPORT_ITEM],
  });
  trackMeta("Purchase", { value: PRICE_INR, currency: CURRENCY }, orderId);
  return true;
}
