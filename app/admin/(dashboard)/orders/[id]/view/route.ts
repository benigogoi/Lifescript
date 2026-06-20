import { NextResponse } from "next/server";
import { getOrder } from "@/lib/orders";
import { supabaseAdmin, REPORTS_BUCKET } from "@/lib/supabase";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order || !order.pdf_path) {
    return NextResponse.json({ error: "No report available for this order yet." }, { status: 404 });
  }

  const { data, error } = await supabaseAdmin()
    .storage.from(REPORTS_BUCKET)
    .createSignedUrl(order.pdf_path, 300);
  if (error || !data) {
    return NextResponse.json({ error: "Could not generate report URL." }, { status: 500 });
  }

  return NextResponse.redirect(data.signedUrl);
}
