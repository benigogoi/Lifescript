/**
 * LifeScript — order intake schema.
 *
 * The single source of truth for what the order form collects and how it maps
 * to the report engine's `ReportOptions`. Shared by the client form and the
 * server route so validation can't drift between them.
 */
import { z } from "zod";
import type { ReportOptions } from "./report-template";

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
});

export type OrderInput = z.infer<typeof orderInputSchema>;

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
  };
}

// TEMP: ₹1 for live-payment testing before launch. Revert to 99 before going live.
export const PRICE_INR = 1;
