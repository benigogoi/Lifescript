import { NextResponse, after } from "next/server";
import { z } from "zod";
import { getOrderByRazorpayId, updateOrder } from "@/lib/orders";
import { verifyCheckoutSignature } from "@/lib/razorpay";
import { sendAdminOrderNotification, sendOrderConfirmation } from "@/lib/email";
import { processPaidOrder } from "@/lib/generate";

export const runtime = "nodejs";
// processPaidOrder (Claude call + Puppeteer PDF render) runs in the after()
// callback below, within this same invocation's budget. Assamese reports
// generate the full narrative (~7k output tokens ≈ 2-3 min) — 60s killed the
// function mid-generation, stranding orders in 'generating'.
export const maxDuration = 300;

const verifySchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

/**
 * Confirm a Razorpay Checkout success: verify the signature, then flip the order
 * to 'paid'. This is the fast client-driven path; a webhook (added on deploy)
 * is the authoritative backstop for users who close the tab after paying.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = verifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payment data." }, { status: 400 });
  }
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;

  const valid = verifyCheckoutSignature({
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });
  if (!valid) {
    return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
  }

  const order = await getOrderByRazorpayId(razorpay_order_id);
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  // Idempotent: a retry, or a webhook that already advanced the order, must not error.
  if (order.status === "created") {
    await updateOrder(order.id, { status: "paid", razorpay_payment_id });

    // Instant confirmation email. Independent of report generation — it must not
    // wait on (or fail because of) the Claude pipeline. Don't let an email hiccup
    // fail the payment confirmation; a webhook/retry can cover gaps later.
    try {
      await sendOrderConfirmation({
        to: order.email,
        firstName: order.full_name.split(/\s+/)[0] ?? order.full_name,
        lang: order.report_lang ?? "en",
      });
    } catch (e) {
      console.error("confirmation email failed", e);
    }

    // Owner alert — so a paid order is never missed even if the admin
    // dashboard isn't open (e.g. offline when the payment lands).
    try {
      await sendAdminOrderNotification({
        fullName: order.full_name,
        email: order.email,
        tier: order.tier,
        amountInr: order.amount_inr,
        orderId: order.id,
      });
    } catch (e) {
      console.error("admin order notification failed", e);
    }

    // Kick off report generation in the background — fire-and-forget so the
    // customer's confirmation returns instantly. processPaidOrder generates +
    // stores the PDF then schedules (doesn't send) delivery; the cron at
    // /api/cron/deliver sends it after the randomized delay. The webhook route
    // is the authoritative backstop if the customer closes the tab before this
    // call fires.
    after(() => processPaidOrder({ ...order, status: "paid", razorpay_payment_id }));
  }

  return NextResponse.json({ ok: true, orderId: order.id });
}
