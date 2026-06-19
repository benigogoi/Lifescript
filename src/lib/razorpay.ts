/**
 * LifeScript — Razorpay server client + signature verification.
 *
 * Server-only. The key secret never reaches the browser; only the public
 * NEXT_PUBLIC_RAZORPAY_KEY_ID is used client-side to open Checkout.
 */
import "server-only";
import crypto from "node:crypto";
import Razorpay from "razorpay";

let cached: Razorpay | null = null;

export function razorpay(): Razorpay {
  if (cached) return cached;

  const key_id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    throw new Error(
      "Razorpay is not configured. Set NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.local.",
    );
  }

  cached = new Razorpay({ key_id, key_secret });
  return cached;
}

/**
 * Verify the Razorpay Checkout success signature.
 * Razorpay signs `${razorpay_order_id}|${razorpay_payment_id}` with HMAC-SHA256
 * keyed by the key secret. A timing-safe compare guards against side channels.
 */
export function verifyCheckoutSignature(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  signature: string;
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) throw new Error("RAZORPAY_KEY_SECRET is not set.");

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${params.razorpayOrderId}|${params.razorpayPaymentId}`)
    .digest("hex");

  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(params.signature, "utf8");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
