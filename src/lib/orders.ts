/**
 * Mystic Digits — orders data access.
 *
 * Thin, typed wrapper over the `orders` table. Server-only (uses the admin
 * client). Keeps SQL/column names in one place so routes and jobs stay clean.
 */
import "server-only";
import { supabaseAdmin } from "./supabase";
import type { OrderInput } from "./order";

export type OrderStatus =
  | "created"
  | "paid"
  | "generating"
  | "ready"
  | "scheduled"
  | "sent"
  | "held"
  | "failed";

export interface Order {
  id: string;
  created_at: string;
  updated_at: string;
  full_name: string;
  email: string;
  dob_day: number;
  dob_month: number;
  dob_year: number;
  tier: string;
  amount_inr: number;
  status: OrderStatus;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  pdf_path: string | null;
  scheduled_at: string | null;
  sent_at: string | null;
  error: string | null;
  /** Claude API cost for this order's content generation, in USD. */
  claude_cost_usd: number | null;
}

const TABLE = "orders";

/** Create an order row in the 'created' state (awaiting payment). */
export async function createOrder(
  input: OrderInput,
  opts: { tier?: string; amountInr?: number; razorpayOrderId?: string } = {},
): Promise<Order> {
  const { data, error } = await supabaseAdmin()
    .from(TABLE)
    .insert({
      full_name: input.fullName,
      email: input.email,
      dob_day: input.day,
      dob_month: input.month,
      dob_year: input.year,
      tier: opts.tier ?? "numerology",
      amount_inr: opts.amountInr ?? 99,
      razorpay_order_id: opts.razorpayOrderId ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Order;
}

export async function getOrder(id: string): Promise<Order | null> {
  const { data, error } = await supabaseAdmin().from(TABLE).select().eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as Order) ?? null;
}

export async function getOrderByRazorpayId(razorpayOrderId: string): Promise<Order | null> {
  const { data, error } = await supabaseAdmin()
    .from(TABLE)
    .select()
    .eq("razorpay_order_id", razorpayOrderId)
    .maybeSingle();
  if (error) throw error;
  return (data as Order) ?? null;
}

/** Patch an order (status transitions, pdf_path, scheduled_at, etc.). */
export async function updateOrder(
  id: string,
  patch: Partial<Omit<Order, "id" | "created_at" | "updated_at">>,
): Promise<Order> {
  const { data, error } = await supabaseAdmin().from(TABLE).update(patch).eq("id", id).select().single();
  if (error) throw error;
  return data as Order;
}

export async function listOrders(status?: OrderStatus): Promise<Order[]> {
  let q = supabaseAdmin().from(TABLE).select().order("created_at", { ascending: false });
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error) throw error;
  return (data as Order[]) ?? [];
}

/** Orders whose scheduled send time has arrived (for the delivery cron). */
export async function listDueForDelivery(now = new Date()): Promise<Order[]> {
  const { data, error } = await supabaseAdmin()
    .from(TABLE)
    .select()
    .eq("status", "scheduled")
    .lte("scheduled_at", now.toISOString());
  if (error) throw error;
  return (data as Order[]) ?? [];
}
