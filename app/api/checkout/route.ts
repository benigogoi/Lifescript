import { NextResponse } from "next/server";
import { z } from "zod";
import { orderInputSchema, isRealDate, PRICE_INR } from "@/lib/order";
import { createOrder, updateOrder } from "@/lib/orders";
import { razorpay } from "@/lib/razorpay";

// Razorpay SDK + Supabase admin run on Node, not the Edge runtime.
export const runtime = "nodejs";

// Client-captured attribution (see src/lib/attribution.ts). Untrusted input:
// every field is optional and length-capped, and a malformed payload degrades
// to null rather than failing checkout.
const touchSchema = z
  .object({
    source: z.string().max(200),
    medium: z.string().max(200).nullish(),
    campaign: z.string().max(200).nullish(),
    term: z.string().max(200).nullish(),
    content: z.string().max(200).nullish(),
    gclid: z.string().max(500).nullish(),
    fbclid: z.string().max(500).nullish(),
    referrer: z.string().max(1000).nullish(),
    landing_page: z.string().max(1000).nullish(),
    at: z.string().max(50).nullish(),
  })
  .strip();

const attributionSchema = z
  .object({ first_touch: touchSchema, last_touch: touchSchema })
  .strip();

function parseAttribution(body: unknown): Record<string, unknown> | null {
  if (typeof body !== "object" || body === null) return null;
  const raw = (body as { attribution?: unknown }).attribution;
  const parsed = attributionSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

/**
 * Begin checkout: persist a 'created' order, create the matching Razorpay order,
 * and return the params the browser needs to open Razorpay Checkout. No money
 * has moved yet — the order flips to 'paid' only after /api/checkout/verify.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = orderInputSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "Please check your details.";
    return NextResponse.json({ error: first }, { status: 400 });
  }
  const input = parsed.data;

  if (!isRealDate(input)) {
    return NextResponse.json({ error: "That date of birth isn't a real date." }, { status: 400 });
  }

  try {
    // 1. Our order row first, so we own the id used as the Razorpay receipt.
    const order = await createOrder(input, {
      amountInr: PRICE_INR,
      attribution: parseAttribution(body),
    });

    // 2. The Razorpay order (amount is in paise).
    const rzpOrder = await razorpay().orders.create({
      amount: PRICE_INR * 100,
      currency: "INR",
      receipt: order.id,
      notes: { mysticdigits_order_id: order.id },
    });

    // 3. Link them so the verify step (and later the webhook) can find the row.
    await updateOrder(order.id, { razorpay_order_id: rzpOrder.id });

    return NextResponse.json({
      orderId: order.id,
      razorpayOrderId: rzpOrder.id,
      amount: PRICE_INR * 100,
      currency: "INR",
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      prefill: { name: input.fullName, email: input.email },
    });
  } catch (err) {
    console.error("checkout error", err);
    return NextResponse.json({ error: "Could not start checkout. Please try again." }, { status: 500 });
  }
}
