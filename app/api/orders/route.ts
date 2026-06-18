import { NextResponse } from "next/server";
import { orderInputSchema, isRealDate } from "@/lib/order";
import { calculateNumerology } from "@/lib/numerology";

// The report engine + (later) PDF rendering run on Node, not the Edge runtime.
export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = orderInputSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "Please check your details.";
    return NextResponse.json({ error: first }, { status: 400 });
  }
  const input = parsed.data;

  if (!isRealDate(input)) {
    return NextResponse.json({ error: "That date of birth isn't a real date." }, { status: 400 });
  }

  // Free instant teaser — the core numbers only. The paid report reads the
  // full chart together (Lo Shu, years ahead, remedies, etc.).
  const r = calculateNumerology(input);
  const preview = {
    firstName: r.input.firstName,
    mulank: { number: r.mulank.number, planet: r.mulank.planet },
    bhagyank: { number: r.bhagyank.number, planet: r.bhagyank.planet },
    name: { number: r.nameNumber.number, planet: r.nameNumber.planet },
  };

  // TODO(step 3–4): persist the order in Supabase and create a Razorpay order
  // here, returning the checkout parameters instead of just the preview.
  return NextResponse.json({ ok: true, preview });
}
