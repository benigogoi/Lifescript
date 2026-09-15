/**
 * calculations added for the 27-page test report.
 *
 * - Full-name reading: Chaldean letter total, compound number (10–52) and
 *   single number, judged against the person's Mulank and Bhagyank using the
 *   same planetary-friendship table as the Year Ahead tiers (yearFavourability).
 * - Spelling options: one small, pronounceable change to the first name
 *   (a doubled letter, an added a/h, ee/oo) that brings the full name into
 *   alignment.
 * - Personal Year / Personal Month: one-step, birth-date based.
 */
import { letterValue, reduceToSingleDigit, type Digit } from "../numerology";
import { yearFavourability, type YearTier } from "../report-data";
import { COMPOUND, type Tone } from "./data";

export type Verdict = "aligned" | "partly" | "misaligned";

export const VERDICT_LABEL: Record<Verdict, string> = {
  aligned: "Aligned",
  partly: "Partly aligned",
  misaligned: "Not aligned",
};

export function digitSum(n: number): number {
  return String(n)
    .split("")
    .reduce((s, c) => s + Number(c), 0);
}

/** "58 → 13 → 4" */
export function reduceChain(n: number): string {
  const steps = [n];
  let v = n;
  while (v > 9) {
    v = digitSum(v);
    steps.push(v);
  }
  return steps.join(" → ");
}

export function chaldeanTotal(name: string): number {
  return name.split("").reduce((t, ch) => t + letterValue(ch), 0);
}

/** Compound vibration of a letter total: totals above 52 are digit-summed back into the 10–52 table. */
export function compoundOf(total: number): number | null {
  let v = total;
  while (v > 52) v = digitSum(v);
  return v >= 10 ? v : null;
}

export interface NameAssessment {
  full: string;
  firstName: string;
  total: number;
  compound: number | null;
  single: Digit;
  tone: Tone;
  withMulank: YearTier;
  withBhagyank: YearTier;
  verdict: Verdict;
}

const friendly = (t: YearTier) => t === "Highly Favourable" || t === "Favourable";

export function assessName(fullName: string, mulank: Digit, bhagyank: Digit): NameAssessment {
  const full = fullName.trim().replace(/\s+/g, " ");
  const total = chaldeanTotal(full);
  const compound = compoundOf(total);
  const single = reduceToSingleDigit(total);
  const tone: Tone = compound ? COMPOUND[compound].tone : "neutral";
  const withMulank = yearFavourability(mulank, single);
  const withBhagyank = yearFavourability(bhagyank, single);

  // Aligned: friendly with at least one birth number, in tension with neither,
  // and a compound that isn't a caution number. Requiring friendship with BOTH
  // leaves most Mulank/Bhagyank pairs with no workable spelling at all.
  const anyFriend = friendly(withMulank) || friendly(withBhagyank);
  const tension = withMulank === "Challenging" || withBhagyank === "Challenging";
  const caution = tone === "caution";
  const verdict: Verdict =
    anyFriend && !tension && !caution ? "aligned" : anyFriend && !(tension && caution) ? "partly" : "misaligned";

  return { full, firstName: full.split(" ")[0], total, compound, single, tone, withMulank, withBhagyank, verdict };
}

interface Variant {
  word: string;
  /** 1 = doubled letter (most common correction), 2 = added a/h, 3 = ee/oo. */
  rank: number;
}

const VOWEL = /[aeiou]/;

/** Small spelling changes that keep a word pronounceable the way Indian names are commonly respelt. */
function variantsOf(word: string): Variant[] {
  const lower = word.toLowerCase();
  const out = new Map<string, number>();
  const add = (v: string, rank: number) => {
    if (v !== lower && !/(.)\1\1/.test(v) && !out.has(v)) out.set(v, rank);
  };

  for (let i = 1; i < lower.length; i++) {
    const ch = lower[i];
    const prev = lower[i - 1];
    const next = lower[i + 1];
    if (!/[a-z]/.test(ch) || prev === ch || next === ch) continue;
    // aa / ee / oo read naturally; ii and uu don't (ee/oo below cover those sounds).
    if (/[aeo]/.test(ch)) add(lower.slice(0, i + 1) + ch + lower.slice(i + 1), 1);
    // A consonant doubles naturally only between vowels: Ravi → Ravvi, not Snneha.
    else if (!/[aeiouyhwjqx]/.test(ch) && VOWEL.test(prev) && next && VOWEL.test(next)) {
      add(lower.slice(0, i + 1) + ch + lower.slice(i + 1), 1);
    }
  }
  if (/[^aeiouy]$/.test(lower)) add(`${lower}a`, 2);
  if (VOWEL.test(lower.slice(-1))) add(`${lower}h`, 2);
  for (let i = 0; i < lower.length - 1; i++) {
    if ("tdbkgp".includes(lower[i]) && VOWEL.test(lower[i + 1])) add(lower.slice(0, i + 1) + "h" + lower.slice(i + 1), 2);
  }
  for (let i = 1; i < lower.length; i++) {
    if (lower[i] === "i" && lower[i - 1] !== "i" && lower[i + 1] !== "i") add(lower.slice(0, i) + "ee" + lower.slice(i + 1), 3);
    if (lower[i] === "u" && lower[i - 1] !== "u" && lower[i + 1] !== "u") add(lower.slice(0, i) + "oo" + lower.slice(i + 1), 3);
  }

  return [...out].map(([v, rank]) => ({ word: v[0].toUpperCase() + v.slice(1), rank }));
}

const toneRank = (t: Tone) => (t === "fortunate" ? 2 : t === "neutral" ? 1 : 0);
const harmony = (a: NameAssessment) =>
  (a.withMulank === "Highly Favourable" ? 1 : 0) + (a.withBhagyank === "Highly Favourable" ? 1 : 0);

/**
 * Up to `limit` aligned spellings of the full name. The surname (last word)
 * is never changed — a family name isn't the customer's to restyle. One small
 * change to the first name is preferred, then the middle name; only if that
 * finds too few options do we try one small change in each of two given names.
 */
export function suggestSpellings(fullName: string, mulank: Digit, bhagyank: Digit, limit = 3): NameAssessment[] {
  const words = fullName.trim().split(/\s+/);
  const givenNames = words.length > 1 ? words.length - 1 : 1;
  const singles = words.slice(0, givenNames).flatMap((w, idx) =>
    variantsOf(w).map((v) => ({ idx, word: v.word, rank: v.rank + (idx === 0 ? 0 : 3) })),
  );
  const withChanges = (changes: { idx: number; word: string }[]) =>
    assessName(words.map((orig, j) => changes.find((c) => c.idx === j)?.word ?? orig).join(" "), mulank, bhagyank);

  let pool = singles.map((s) => ({ rank: s.rank, a: withChanges([s]) })).filter(({ a }) => a.verdict === "aligned");

  if (pool.length < limit) {
    for (let i = 0; i < singles.length; i++) {
      for (let j = i + 1; j < singles.length; j++) {
        if (singles[i].idx === singles[j].idx) continue;
        const a = withChanges([singles[i], singles[j]]);
        if (a.verdict === "aligned") pool.push({ rank: singles[i].rank + singles[j].rank + 4, a });
      }
    }
  }

  const seen = new Set<string>();
  return pool
    .sort(
      (x, y) =>
        x.rank - y.rank ||
        toneRank(y.a.tone) - toneRank(x.a.tone) ||
        harmony(y.a) - harmony(x.a) ||
        x.a.full.length - y.a.full.length,
    )
    .filter(({ a }) => (seen.has(a.full) ? false : (seen.add(a.full), true)))
    .slice(0, limit)
    .map(({ a }) => a);
}

export interface NameFill {
  digit: Digit;
  /** e.g. "Name Number 4" */
  by: string;
}

/**
 * Missing Lo Shu digits that the person's name numbers supply. The grid is
 * built from the birth date alone, but traditionally a name number equal to
 * a missing digit is read as the name filling that gap.
 */
export function missingFilledByName(missing: Digit[], nameNumber: Digit, fullNameNumber: Digit): NameFill[] {
  return missing.flatMap((d) =>
    d === nameNumber
      ? [{ digit: d, by: `Name Number ${d}` }]
      : d === fullNameNumber
        ? [{ digit: d, by: `Full-Name Number ${d}` }]
        : [],
  );
}

/** Birth day, birth month and calendar year, each reduced, then summed and reduced. */
export function personalYearSum(day: number, month: number, year: number): number {
  return reduceToSingleDigit(day) + reduceToSingleDigit(month) + reduceToSingleDigit(year);
}

export function personalYear(day: number, month: number, year: number): Digit {
  return reduceToSingleDigit(personalYearSum(day, month, year));
}

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export interface MonthAhead {
  year: number;
  month: number;
  label: string;
  personalYear: Digit;
  personalMonth: Digit;
}

/** The `count` calendar months after `now`, each with its Personal Month number. */
export function nextMonths(now: Date, day: number, month: number, count = 3): MonthAhead[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i + 1, 1);
    const year = d.getFullYear();
    const m = d.getMonth() + 1;
    const py = personalYear(day, month, year);
    return { year, month: m, label: `${MONTH_NAMES[m - 1]} ${year}`, personalYear: py, personalMonth: reduceToSingleDigit(py + m) };
  });
}
