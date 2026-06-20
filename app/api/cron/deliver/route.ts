import { NextResponse } from "next/server";
import { listDueForDelivery } from "@/lib/orders";
import { deliverScheduledOrder } from "@/lib/generate";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Delivery cron — runs every 15 min (see vercel.json), sends any order whose
 * `scheduled_at` has passed. Generation happened earlier in processPaidOrder;
 * this is purely the delayed send step.
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

  return NextResponse.json({ ok: true, delivered: due.length });
}
