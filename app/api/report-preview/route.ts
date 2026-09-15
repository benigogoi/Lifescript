import { NextResponse } from "next/server";
import { z } from "zod";
import { buildReportPreview } from "@/lib/report27/preview";

export const runtime = "nodejs";

const previewSchema = z.object({
  fullName: z.string().trim().min(1).max(80),
  day: z.coerce.number().int().min(1).max(31),
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(1900).max(2100),
});

/**
 * Live preview pages for the report offer, built from the visitor's own name
 * and date of birth. Deterministic — no AI call, nothing stored.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = previewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid details." }, { status: 400 });
  }
  const { fullName, day, month, year } = parsed.data;

  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return NextResponse.json({ error: "Invalid date." }, { status: 400 });
  }

  return NextResponse.json(buildReportPreview({ fullName, day, month, year }), {
    headers: { "Cache-Control": "no-store" },
  });
}
