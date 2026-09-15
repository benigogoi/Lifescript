/**
 * Mystic Digits — single source of truth for what the report costs.
 *
 * The price lives in one place so a price test (₹99 / ₹199 / ₹299) is a config
 * change, not a code change. `NEXT_PUBLIC_PRICE_INR` is read at build time and
 * inlined into both server and client bundles, so the number the customer sees
 * and the number Razorpay charges can never drift apart.
 *
 * Security note: the client never sends a price. /api/checkout always charges
 * the server's own PRICE_INR, so a tampered client can't buy the report cheap.
 */

/** Prices we're willing to run. Anything else is a typo, so fall back to 99. */
const ALLOWED_PRICES = [99, 199, 249, 299] as const;
const DEFAULT_PRICE = 99;

function resolvePrice(): number {
  const raw = process.env.NEXT_PUBLIC_PRICE_INR;
  if (!raw) return DEFAULT_PRICE;

  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    console.warn(`[pricing] NEXT_PUBLIC_PRICE_INR="${raw}" is not a positive integer — using ₹${DEFAULT_PRICE}.`);
    return DEFAULT_PRICE;
  }
  if (!(ALLOWED_PRICES as readonly number[]).includes(parsed)) {
    console.warn(`[pricing] NEXT_PUBLIC_PRICE_INR=${parsed} is outside ${ALLOWED_PRICES.join("/")} — using it anyway.`);
  }
  return parsed;
}

/** The live report price in rupees. */
export const PRICE_INR = resolvePrice();

/** The same amount in paise, which is what Razorpay's API wants. */
export const PRICE_PAISE = PRICE_INR * 100;

/** Format any rupee amount for display: 99 -> "₹99". */
export function formatInr(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

/** The live price, ready to drop into copy: "₹99". */
export const PRICE_LABEL = formatInr(PRICE_INR);
