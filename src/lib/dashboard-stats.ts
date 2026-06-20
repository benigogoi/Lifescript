/**
 * LifeScript — dashboard aggregation helpers. Pure functions over an Order[]
 * (already fetched), so the dashboard page stays a thin presentation layer.
 */
import type { Order } from "./orders";

export interface DailyBucket {
  date: string; // YYYY-MM-DD
  orders: number;
  revenueInr: number;
}

/** Bucket paid+ orders by day for the last `days` days (oldest first). */
export function dailyRevenue(orders: Order[], days: number): DailyBucket[] {
  const buckets = new Map<string, DailyBucket>();
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    buckets.set(key, { date: key, orders: 0, revenueInr: 0 });
  }

  for (const o of orders) {
    if (o.status === "created") continue; // unpaid, not real revenue
    const key = o.created_at.slice(0, 10);
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
