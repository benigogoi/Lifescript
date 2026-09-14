/**
 * Mystic Digits — ad landing pages (/posters/[slug]).
 *
 * One entry per Meta ad audience. To launch Mulank 1, 3, 6 or 9, add an entry
 * to POSTERS below — the route, heading, birth dates, price and buttons are all
 * derived, so no new page is needed.
 */
import type { MulankNumber } from "./mulank-content";

export interface Poster {
  mulank: MulankNumber;
  /** 3–4 short, real trait lines shown free below the fold. */
  traits: string[];
}

export const POSTERS: Record<string, Poster> = {
  "mulank-5": {
    mulank: 5,
    traits: [
      "Ruled by Mercury, Mulank 5 people are quick-witted, curious, and adapt to almost any situation.",
      "Talking, persuading and connecting with people come naturally to you — business, sales and marketing suit you well.",
      "Your biggest challenge is boredom: many things get started, far fewer get finished.",
      "2026 is a year of beginnings. Your new idea finds solid ground — pick the best one and see it through.",
    ],
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
  traitsHeading: (n: MulankNumber) => `What Mulank ${n} people are like`,
  sampleHeading: "A real page from the report",
  sampleHint: "Tap to zoom",
  sampleCaption: "From a sample report — yours is made from your own name and date of birth.",
} as const;
