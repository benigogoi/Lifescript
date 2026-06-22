/**
 * Mystic Digits — manual expense tracking for the admin dashboard's net-profit
 * figure. No external integration pulls these automatically; the owner logs
 * them by hand (Claude/Resend/Razorpay fees, hosting, ads, domain, etc.).
 */
import "server-only";
import { supabaseAdmin } from "./supabase";

export interface Expense {
  id: string;
  created_at: string;
  spent_on: string;
  category: string;
  description: string | null;
  amount_inr: number;
}

const TABLE = "expenses";

export async function listExpenses(limit = 50): Promise<Expense[]> {
  const { data, error } = await supabaseAdmin()
    .from(TABLE)
    .select()
    .order("spent_on", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data as Expense[]) ?? [];
}

export async function addExpense(input: {
  category: string;
  description?: string;
  amountInr: number;
  spentOn?: string;
}): Promise<void> {
  const { error } = await supabaseAdmin().from(TABLE).insert({
    category: input.category,
    description: input.description || null,
    amount_inr: input.amountInr,
    spent_on: input.spentOn || new Date().toISOString().slice(0, 10),
  });
  if (error) throw error;
}

export async function deleteExpense(id: string): Promise<void> {
  const { error } = await supabaseAdmin().from(TABLE).delete().eq("id", id);
  if (error) throw error;
}

export async function totalExpenses(): Promise<number> {
  const { data, error } = await supabaseAdmin().from(TABLE).select("amount_inr");
  if (error) throw error;
  return (data ?? []).reduce((sum, row) => sum + (row as { amount_inr: number }).amount_inr, 0);
}
