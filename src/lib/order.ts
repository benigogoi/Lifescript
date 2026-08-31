/**
 * Mystic Digits — order intake schema.
 *
 * The single source of truth for what the order form collects and how it maps
 * to the report engine's `ReportOptions`. Shared by the client form and the
 * server route so validation can't drift between them.
 */
import { z } from "zod";
import type { ReportOptions } from "./report-template";
import { REPORT_LANGS } from "./report-lang";

const currentYear = new Date().getFullYear();

export const orderInputSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Please enter your full name")
    .max(80, "That name looks too long"),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  day: z.coerce.number().int().min(1).max(31),
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce
    .number()
    .int()
    .min(1920, "Year looks too early")
    .max(currentYear, "Year can't be in the future"),
  // Which language the paid report (and its emails) should be in. Optional so
  // older clients / cached pages that don't send it keep working.
  lang: z.enum(REPORT_LANGS).default("en"),
});

export type OrderInput = z.infer<typeof orderInputSchema>;

/**
 * The free preview needs only a name and a date of birth — asking for an email
 * before showing any value is the single biggest drop-off in the funnel, so the
 * preview endpoint validates against this and email is collected at checkout.
 */
export const previewInputSchema = orderInputSchema.omit({ email: true });

export type PreviewInput = z.infer<typeof previewInputSchema>;

/** A real calendar-date check (the schema only bounds each field individually). */
export function isRealDate({ day, month, year }: { day: number; month: number; year: number }): boolean {
  const d = new Date(year, month - 1, day);
  return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day;
}

/** Map a validated order into the report engine's options (this + next year). */
export function toReportOptions(input: OrderInput): ReportOptions {
  const year1 = new Date().getFullYear();
  return {
    fullName: input.fullName,
    day: input.day,
    month: input.month,
    year: input.year,
    year1,
    year2: year1 + 1,
    lang: input.lang,
  };
}

// Price now lives in ./pricing so a price test is a config change. Re-exported
// here because callers have always imported it from this module.
export { PRICE_INR, PRICE_PAISE, PRICE_LABEL, formatInr } from "./pricing";
