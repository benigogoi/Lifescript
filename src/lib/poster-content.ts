/**
 * Mystic Digits — ad landing pages (/posters/[slug]).
 *
 * One entry per Meta ad audience. To launch another Mulank, add an entry to
 * POSTERS below — the route, birth dates, price and buttons are all derived,
 * so no new page is needed.
 *
 * Every selling line must be true of the report the buyer actually receives
 * (report-template.ts / report-data.ts): no invented counts, testimonials or
 * guaranteed outcomes.
 */
import type { MulankNumber } from "./mulank-content";

export interface PosterPoint {
  /** Bold opening words, shown in gold. */
  lead?: string;
  text: string;
}

export interface Poster {
  mulank: MulankNumber;
  /** Replaces the default "Mulank N — Your 2026 Report" heading. */
  heading?: (monthsLeft: number) => string;
  /** Replaces the default "what's inside" line under the heading. */
  subheading?: string;
  pointsHeading: string;
  points: PosterPoint[];
  /** Show the tap-to-zoom sample report page below the points. */
  showSample?: boolean;
  /** Big line above the bottom CTA. */
  closer?: (monthsLeft: number) => string;
  /** Small line under the bottom price. */
  priceAnchor?: string;
}

function monthsLeftPhrase(m: number): string {
  if (m <= 0) return "Your Year Ends This Month";
  return `Only ${m} Month${m === 1 ? "" : "s"} Left in Your Year`;
}

export const POSTERS: Record<string, Poster> = {
  // 2026-only campaign: Universal Year 2026 is 1, Mulank 1's own year. Retire
  // or rewrite before January, when "your year" stops being true.
  "mulank-1": {
    mulank: 1,
    heading: (m) => `Mulank 1: ${monthsLeftPhrase(m)}`,
    subheading: "2026 is your year. Your report shows how to use what's left of it — and what 2027 holds for you.",
    pointsHeading: "What your report tells you",
    points: [
      {
        lead: "Your 2026 and 2027 —",
        text: "both rated Highly Favourable for Mulank 1, and exactly what to do with each.",
      },
      {
        lead: "The numbers missing from your chart —",
        text: "and what each gap is quietly costing you.",
      },
      {
        lead: "Your lucky days, colours and gemstone —",
        text: "so the big moves in these last months land on the right days.",
      },
      {
        lead: "Your Sun mantra and daily remedy —",
        text: "the exact words, and when to say them.",
      },
      {
        lead: "Written for your name and date of birth —",
        text: "not a horoscope thousands of other people are reading.",
      },
    ],
    closer: (m) =>
      m <= 0
        ? "2026 ends this month. Don't walk into 2027 blind."
        : `${m} month${m === 1 ? "" : "s"} left in your year. Don't spend ${m === 1 ? "it" : "them"} guessing.`,
    priceAnchor: "Less than a single Swiggy order · In your inbox within 24 hours",
  },
  "mulank-5": {
    mulank: 5,
    pointsHeading: "What Mulank 5 people are like",
    points: [
      { text: "Ruled by Mercury, Mulank 5 people are quick-witted, curious, and adapt to almost any situation." },
      {
        text: "Talking, persuading and connecting with people come naturally to you — business, sales and marketing suit you well.",
      },
      { text: "Your biggest challenge is boredom: many things get started, far fewer get finished." },
      { text: "2026 is a year of beginnings. Your new idea finds solid ground — pick the best one and see it through." },
    ],
    showSample: true,
  },
};

export const POSTER_SLUGS = Object.keys(POSTERS);

/** Shared UI copy, identical on every poster. */
export const POSTER_COPY = {
  heading: (n: MulankNumber) => `Mulank ${n} — Your 2026 Report`,
  inside: "Lo Shu grid · Lucky colours, days & gemstone · Remedies · Mantra",
  cta: "Get My Report",
  priceNote: "One-time payment · In your inbox within 24 hours",
  payment: "Secure payment via Razorpay · UPI / Cards",
  sampleHeading: "A real page from the report",
  sampleHint: "Tap to zoom",
  sampleCaption: "From a sample report — yours is made from your own name and date of birth.",
} as const;
