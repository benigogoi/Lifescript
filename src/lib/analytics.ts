/**
 * Mystic Digits — centralized client-side analytics.
 *
 * Every GA4 + Meta Pixel event goes through this module so event names,
 * ecommerce parameters, and dedup logic live in exactly one place. All
 * functions are safe to call anywhere: they no-op on the server and when
 * the underlying tag hasn't loaded (ad blockers, consent, slow network).
 *
 * The funnel, and the event fired at each step (GA4 / Meta):
 *
 *   1. Landing page view      → (automatic)          / PageView
 *   2. Calculator started     → calculator_started   / CalculatorStarted (custom)
 *   3. Free result viewed     → generate_lead        / Lead          ← optimise on this
 *   4. Report offer viewed    → view_item            / ViewContent
 *   5. Paid CTA clicked       → add_to_cart          / AddToCart
 *   6. Checkout initiated     → begin_checkout       / InitiateCheckout
 *   7. Payment successful     → purchase             / Purchase (eventID-deduped)
 *
 * Step 7 is also sent server-side via Meta CAPI (src/lib/metaCapi.ts) using the
 * order id as the event id, so the browser and server events deduplicate.
 * Report delivery is a server-side state change and is not a browser event.
 */
import { PRICE_INR } from "./pricing";

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

/** Low-level Meta Pixel standard event. `eventId` enables Meta-side dedup. */
export function trackMeta(event: string, params?: Record<string, unknown>, eventId?: string) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    if (eventId) {
      window.fbq("track", event, params ?? {}, { eventID: eventId });
    } else {
      window.fbq("track", event, params ?? {});
    }
  }
}

/**
 * Low-level Meta Pixel *custom* event. Meta only recognises a fixed set of
 * standard event names; anything else must go through `trackCustom` or it is
 * silently dropped.
 */
export function trackMetaCustom(event: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("trackCustom", event, params ?? {});
  }
}

/**
 * Fire-once guards. Someone editing their date of birth shouldn't inflate the
 * funnel with a second "started" or "result viewed" event on the same page.
 */
const fired = new Set<string>();
function once(key: string, fn: () => void) {
  if (fired.has(key)) return;
  fired.add(key);
  fn();
}

/** Step 2 — first real interaction with the calculator (typing a name/DOB). */
export function trackCalculatorStarted(where: "calculator" | "order") {
  once(`calc_started:${where}`, () => {
    trackGA("calculator_started", { location: where });
    trackMetaCustom("CalculatorStarted", { location: where });
  });
}

/**
 * Step 3 — they submitted name + DOB and their numbers are on screen. This is
 * the moment a stranger becomes a known-intent visitor, and it is the event
 * Meta should optimise toward until Purchase has enough volume to learn from.
 */
export function trackFreeResultViewed(where: "calculator" | "order") {
  once(`free_result:${where}`, () => {
    trackGA("generate_lead", { currency: CURRENCY, value: PRICE_INR, location: where });
    trackMeta("Lead", { content_name: "Free numerology result" });
  });
}

/** Step 4 — the paid report offer (sample pages + price) scrolled into view. */
export function trackOfferViewed(where: "calculator" | "order") {
  once(`offer_viewed:${where}`, () => {
    trackGA("view_item", { currency: CURRENCY, value: PRICE_INR, items: [REPORT_ITEM] });
    trackMeta("ViewContent", {
      content_name: REPORT_ITEM.item_name,
      content_ids: [REPORT_ITEM.item_id],
      content_type: "product",
      value: PRICE_INR,
      currency: CURRENCY,
    });
  });
}

/** Step 5 — they tapped the buy CTA. Intent, but no payment window yet. */
export function trackPaidCtaClicked(where: "calculator" | "order") {
  trackGA("add_to_cart", { currency: CURRENCY, value: PRICE_INR, items: [REPORT_ITEM], location: where });
  trackMeta("AddToCart", {
    content_name: REPORT_ITEM.item_name,
    content_ids: [REPORT_ITEM.item_id],
    content_type: "product",
    value: PRICE_INR,
    currency: CURRENCY,
  });
}

/** Step 6 — the Razorpay window is opening. */
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
 * Step 7 — fire the purchase conversion exactly once per order.
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
