/**
 * LifeScript — dashboard aggregation helpers. Pure functions over an Order[]
 * (already fetched), so the dashboard page stays a thin presentation layer.
 */
import type { Order } from "./orders";

export interface DailyBucket {
  date: string; // YYYY-MM-DD, in IST
  orders: number;
  revenueInr: number;
}

// The server (Vercel) runs in UTC, but the business operates on IST days —
// midnight-5:30am IST orders would otherwise land in the previous UTC day's
// bucket. en-CA gives a YYYY-MM-DD string, matching the `date` key format.
const istDateFormatter = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" });
function istDateKey(d: Date): string {
  return istDateFormatter.format(d);
}

/** Bucket paid+ orders by IST day for the last `days` days (oldest first). */
export function dailyRevenue(orders: Order[], days: number): DailyBucket[] {
  const buckets = new Map<string, DailyBucket>();
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = istDateKey(d);
    buckets.set(key, { date: key, orders: 0, revenueInr: 0 });
  }

  for (const o of orders) {
    if (o.status === "created") continue; // unpaid, not real revenue
    const key = istDateKey(new Date(o.created_at));
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.orders += 1;
      bucket.revenueInr += o.amount_inr;
    }
  }

  return Array.from(buckets.values());
}

export function totalRevenue(orders: Order[]): number {
  return orders.filter((o) => o.status !== "created").reduce((sum, o) => sum + o.amount_inr, 0);
}
