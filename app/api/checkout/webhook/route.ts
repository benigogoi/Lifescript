import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getOrderByRazorpayId, updateOrder } from "@/lib/orders";
import { sendOrderConfirmation } from "@/lib/email";
import { processPaidOrder } from "@/lib/generate";

export const runtime = "nodejs";

/**
 * Razorpay webhook — authoritative backstop for `payment.captured`. Covers
 * customers who pay then close the tab before the client-side verify call
 * fires. Configure this URL + RAZORPAY_WEBHOOK_SECRET in the Razorpay
 * dashboard (Settings → Webhooks).
 */
export async function POST(req: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("RAZORPAY_WEBHOOK_SECRET is not set; rejecting webhook.");
    return NextResponse.json({ error: "Webhook not configured." }, { status: 500 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const event = (payload as { event?: string }).event;
  if (event !== "payment.captured") {
    return NextResponse.json({ ok: true, skipped: event });
  }

  const entity = (payload as { payload?: { payment?: { entity?: Record<string, unknown> } } }).payload
    ?.payment?.entity;
  const razorpayOrderId = entity?.order_id as string | undefined;
  const razorpayPaymentId = entity?.id as string | undefined;
  if (!razorpayOrderId || !razorpayPaymentId) {
    return NextResponse.json({ error: "Missing order/payment id in payload." }, { status: 400 });
  }

  const order = await getOrderByRazorpayId(razorpayOrderId);
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  // Idempotent: the client-side verify call may have already advanced this order.
  if (order.status === "created") {
    await updateOrder(order.id, { status: "paid", razorpay_payment_id: razorpayPaymentId });

    try {
      await sendOrderConfirmation({
        to: order.email,
        firstName: order.full_name.split(/\s+/)[0] ?? order.full_name,
      });
    } catch (e) {
      console.error("confirmation email failed", e);
    }

    void processPaidOrder({ ...order, status: "paid", razorpay_payment_id: razorpayPaymentId });
  }

  return NextResponse.json({ ok: true });
}
