/**
 * Mystic Digits — orders data access.
 *
 * Thin, typed wrapper over the `orders` table. Server-only (uses the admin
 * client). Keeps SQL/column names in one place so routes and jobs stay clean.
 */
import "server-only";
import { supabaseAdmin } from "./supabase";
import type { OrderInput } from "./order";
import type { ReportLang } from "./report-lang";

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
  /** Language of the paid report + emails: 'en' | 'as' ('hi' reserved). */
  report_lang: ReportLang;
  /** Traffic origin captured at checkout: { first_touch, last_touch } with
   * utm_*, gclid, fbclid, referrer, landing_page (see src/lib/attribution.ts). */
  attribution: Record<string, unknown> | null;
}

const TABLE = "orders";

/** Create an order row in the 'created' state (awaiting payment). */
export async function createOrder(
  input: OrderInput,
  opts: {
    tier?: string;
    amountInr?: number;
    razorpayOrderId?: string;
    attribution?: Record<string, unknown> | null;
  } = {},
): Promise<Order> {
  const row = {
    full_name: input.fullName,
    email: input.email,
    dob_day: input.day,
    dob_month: input.month,
    dob_year: input.year,
    tier: opts.tier ?? "numerology",
    amount_inr: opts.amountInr ?? 99,
    razorpay_order_id: opts.razorpayOrderId ?? null,
    attribution: opts.attribution ?? null,
    report_lang: input.lang ?? "en",
  };

  let { data, error } = await supabaseAdmin().from(TABLE).insert(row).select().single();

  // A checkout must never fail over optional metadata: if a newer column
  // doesn't exist yet (migration 0004/0005 not applied), retry without it.
  // NOTE: dropping report_lang silently downgrades the order to English —
  // acceptable only as a never-fail-checkout last resort; apply 0005 before
  // exposing the language selector.
  if (error?.code === "PGRST204") {
    console.error("orders column missing (run migrations 0004/0005); saving order without optional columns");
    const { attribution: _dropped, report_lang: _dropped2, ...bare } = row;
    ({ data, error } = await supabaseAdmin().from(TABLE).insert(bare).select().single());
  }

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

/**
 * One page of orders (newest first) plus the total row count for the filter.
 * `page` is 1-based and clamped to the last page, so a stale ?page= URL never 416s.
 */
export async function listOrdersPage(opts: {
  statuses?: readonly OrderStatus[];
  page: number;
  pageSize: number;
}): Promise<{ orders: Order[]; total: number; page: number }> {
  let countQuery = supabaseAdmin().from(TABLE).select("id", { count: "exact", head: true });
  if (opts.statuses?.length) countQuery = countQuery.in("status", [...opts.statuses]);
  const { count, error: countError } = await countQuery;
  if (countError) throw countError;

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / opts.pageSize));
  const page = Math.min(Math.max(1, opts.page), totalPages);
  if (total === 0) return { orders: [], total, page };

  const offset = (page - 1) * opts.pageSize;
  let q = supabaseAdmin()
    .from(TABLE)
    .select()
    .order("created_at", { ascending: false })
    .range(offset, offset + opts.pageSize - 1);
  if (opts.statuses?.length) q = q.in("status", [...opts.statuses]);
  const { data, error } = await q;
  if (error) throw error;
  return { orders: (data as Order[]) ?? [], total, page };
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
