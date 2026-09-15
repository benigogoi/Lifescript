import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

/**
 * Daily keep-alive (scheduled in vercel.json). Supabase's free plan pauses a
 * project after about a week without activity, which silently breaks checkout
 * — every order is written to the database before Razorpay opens. One tiny
 * read a day counts as activity and keeps it awake.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabaseAdmin().from("orders").select("id", { head: true, count: "exact" }).limit(1);
  if (error) {
    console.error("supabase keepalive failed", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
