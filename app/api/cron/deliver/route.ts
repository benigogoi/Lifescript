import { NextResponse } from "next/server";
import { listAbandonedCheckouts, listDueForDelivery, updateOrder } from "@/lib/orders";
import { deliverScheduledOrder } from "@/lib/generate";
import { sendAbandonedCheckoutEmail } from "@/lib/email";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Delivery cron — runs every 15 min (see vercel.json), sends any order whose
 * `scheduled_at` has passed. Generation happened earlier in processPaidOrder;
 * this is purely the delayed send step.
 *
 * Also carries the abandoned-checkout recovery pass: no separate schedule
 * exists to hang it off, and it's cheap/idempotent, so it rides this cron
 * instead of provisioning a second one.
 */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const due = await listDueForDelivery();
  for (const order of due) {
    await deliverScheduledOrder(order);
  }

  const abandoned = await listAbandonedCheckouts();
  let recovered = 0;
  for (const order of abandoned) {
    try {
      await sendAbandonedCheckoutEmail({
        to: order.email,
        firstName: order.full_name.split(/\s+/)[0] ?? order.full_name,
        lang: order.report_lang ?? "en",
      });
      await updateOrder(order.id, { recovery_email_sent_at: new Date().toISOString() });
      recovered++;
    } catch (e) {
      // One flaky send must not block the rest of the batch or the delivery
      // pass above; it'll be retried on the next run since we only mark
      // recovery_email_sent_at on success.
      console.error("abandoned checkout recovery email failed", order.id, e);
    }
  }

  return NextResponse.json({ ok: true, delivered: due.length, recovered });
}
