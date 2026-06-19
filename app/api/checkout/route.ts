import { NextResponse } from "next/server";
import { orderInputSchema, isRealDate, PRICE_INR } from "@/lib/order";
import { createOrder, updateOrder } from "@/lib/orders";
import { razorpay } from "@/lib/razorpay";

// Razorpay SDK + Supabase admin run on Node, not the Edge runtime.
export const runtime = "nodejs";

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
    const order = await createOrder(input, { amountInr: PRICE_INR });

    // 2. The Razorpay order (amount is in paise).
    const rzpOrder = await razorpay().orders.create({
      amount: PRICE_INR * 100,
      currency: "INR",
      receipt: order.id,
      notes: { lifescript_order_id: order.id },
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
