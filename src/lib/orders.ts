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
  /** Set once the abandoned-checkout recovery email has been sent (never resent). */
  recovery_email_sent_at: string | null;
  /** Internal/QA order (owner's own test emails, ₹1 dev amounts) — excluded
   * from the admin dashboard's revenue/order stats and the default orders list. */
  is_test: boolean;
}

const TABLE = "orders";

/** Owner's own emails, used to auto-flag self-testing so it never has to be
 * cleaned up by hand again (see migration 0007 for the one-time backfill). */
const TEST_EMAILS = new Set(["beni.gogoi1@gmail.com", "benigogoi28@gmail.com"]);

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
    is_test: TEST_EMAILS.has(input.email) || (opts.amountInr ?? 99) === 1,
  };

  let { data, error } = await supabaseAdmin().from(TABLE).insert(row).select().single();

  // A checkout must never fail over optional metadata: if a newer column
  // doesn't exist yet (migration 0004/0005/0007 not applied), retry without it.
  // NOTE: dropping report_lang silently downgrades the order to English —
  // acceptable only as a never-fail-checkout last resort; apply the migrations
  // before exposing the language selector.
  if (error?.code === "PGRST204") {
    console.error("orders column missing (run migrations 0004/0005/0007); saving order without optional columns");
    const { attribution: _dropped, report_lang: _dropped2, is_test: _dropped3, ...bare } = row;
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

/** `includeTest` defaults to false — internal/QA orders (see `is_test`) are
 * noise everywhere this is used (dashboard stats, delivery lists). */
export async function listOrders(
  status?: OrderStatus,
  opts: { includeTest?: boolean } = {},
): Promise<Order[]> {
  let q = supabaseAdmin().from(TABLE).select().order("created_at", { ascending: false });
  if (status) q = q.eq("status", status);
  if (!opts.includeTest) q = q.eq("is_test", false);
  const { data, error } = await q;
  if (error) throw error;
  return (data as Order[]) ?? [];
}

/**
 * One page of orders (newest first) plus the total row count for the filter.
 * `page` is 1-based and clamped to the last page, so a stale ?page= URL never 416s.
 * `testFilter` defaults to "real" (excludes internal/QA orders); pass "test"
 * for the admin's Test tab or "all" to see everything.
 */
export async function listOrdersPage(opts: {
  statuses?: readonly OrderStatus[];
  testFilter?: "real" | "test" | "all";
  page: number;
  pageSize: number;
}): Promise<{ orders: Order[]; total: number; page: number }> {
  const testFilter = opts.testFilter ?? "real";

  let countQuery = supabaseAdmin().from(TABLE).select("id", { count: "exact", head: true });
  if (opts.statuses?.length) countQuery = countQuery.in("status", [...opts.statuses]);
  if (testFilter !== "all") countQuery = countQuery.eq("is_test", testFilter === "test");
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
  if (testFilter !== "all") q = q.eq("is_test", testFilter === "test");
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
