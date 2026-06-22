/**
 * Mystic Digits — Indian / Vedic Numerology Engine
 *
 * Implements the calculation rules defined in the project brief.
 * All numbers reduce fully to a single digit 1–9 (no Western master numbers),
 * matching the brief's example: 28 -> 2+8 = 10 -> 1.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Digit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type Planet =
  | "Sun"
  | "Moon"
  | "Jupiter"
  | "Rahu"
  | "Mercury"
  | "Venus"
  | "Ketu"
  | "Saturn"
  | "Mars";

/** Planet ruling each numerology number (brief: Indian/Vedic mapping). */
export const PLANET_BY_NUMBER: Record<Digit, Planet> = {
  1: "Sun",
  2: "Moon",
  3: "Jupiter",
  4: "Rahu",
  5: "Mercury",
  6: "Venus",
  7: "Ketu",
  8: "Saturn",
  9: "Mars",
};

/** Standard Lo Shu magic square layout (the fixed position of each digit). */
export const LO_SHU_LAYOUT: Digit[][] = [
  [4, 9, 2],
  [3, 5, 7],
  [8, 1, 6],
];

export interface LoShuGrid {
  /** Count of how many times each digit 1–9 appears in the DOB. */
  counts: Record<Digit, number>;
  /** Digits 1–9 that do not appear at all in the DOB. */
  missing: Digit[];
  /** Digits that appear more than once (repeated planes/intensity). */
  repeated: Digit[];
  /** 3x3 grid mirroring LO_SHU_LAYOUT, each cell = count for that position's digit. */
  grid: { digit: Digit; count: number }[][];
}

export interface NumerologyResult {
  input: {
    fullName: string;
    firstName: string;
    day: number;
    month: number;
    year: number;
  };
  mulank: { number: Digit; planet: Planet };
  bhagyank: { number: Digit; planet: Planet };
  nameNumber: { number: Digit; planet: Planet };
  loShu: LoShuGrid;
}

// ---------------------------------------------------------------------------
// Core reduction
// ---------------------------------------------------------------------------

/**
 * Reduce a positive integer to a single digit 1–9 by repeatedly summing digits.
 * e.g. 28 -> 10 -> 1.  Returns 9 for multiples of 9 (digital root), never 0
 * for a positive input.
 */
export function reduceToSingleDigit(n: number): Digit {
  let value = Math.abs(Math.trunc(n));
  while (value > 9) {
    value = String(value)
      .split("")
      .reduce((sum, ch) => sum + Number(ch), 0);
  }
  return (value === 0 ? 9 : value) as Digit;
}

// ---------------------------------------------------------------------------
// Name number (Chaldean)
// ---------------------------------------------------------------------------

/**
 * Chaldean letter values — the system actually used by Indian/Vedic
 * numerology (via Cheiro), not the Western Pythagorean A=1..Z=26 scheme.
 * Letters are grouped by sound/vibration rather than alphabet order, and
 * 9 is never assigned to a letter (considered too sacred/complete).
 */
const CHALDEAN_VALUES: Record<string, number> = {
  A: 1, I: 1, J: 1, Q: 1, Y: 1,
  B: 2, K: 2, R: 2,
  C: 3, G: 3, L: 3, S: 3,
  D: 4, M: 4, T: 4,
  E: 5, H: 5, N: 5, X: 5,
  U: 6, V: 6, W: 6,
  O: 7, Z: 7,
  F: 8, P: 8,
};

/** Chaldean value of a letter. Non-letters return 0. */
export function letterValue(ch: string): number {
  return CHALDEAN_VALUES[ch.toUpperCase()] ?? 0;
}

/** Sum the Chaldean values of a word and reduce to a single digit. */
export function nameNumberOf(name: string): Digit {
  const sum = name
    .split("")
    .reduce((total, ch) => total + letterValue(ch), 0);
  return reduceToSingleDigit(sum);
}

// ---------------------------------------------------------------------------
// Lo Shu grid
// ---------------------------------------------------------------------------

/**
 * Build the Lo Shu grid from the digits of the date of birth (DDMMYYYY).
 * Zeros are ignored (they have no plane in the grid).
 */
export function loShuGrid(day: number, month: number, year: number): LoShuGrid {
  const digits = `${pad2(day)}${pad2(month)}${year}`
    .split("")
    .map(Number)
    .filter((d) => d >= 1 && d <= 9) as Digit[];

  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 } as Record<Digit, number>;
  for (const d of digits) counts[d] += 1;

  const missing = (Object.keys(counts) as unknown as string[])
    .map(Number)
    .filter((d) => counts[d as Digit] === 0) as Digit[];

  const repeated = (Object.keys(counts) as unknown as string[])
    .map(Number)
    .filter((d) => counts[d as Digit] > 1) as Digit[];

  const grid = LO_SHU_LAYOUT.map((row) =>
    row.map((digit) => ({ digit, count: counts[digit] }))
  );

  return { counts, missing, repeated, grid };
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export interface BirthInput {
  fullName: string;
  /** Day of month, 1–31 */
  day: number;
  /** Month, 1–12 */
  month: number;
  /** Full year, e.g. 1995 */
  year: number;
}

export function calculateNumerology(input: BirthInput): NumerologyResult {
  const { fullName, day, month, year } = input;
  const firstName = fullName.trim().split(/\s+/)[0] ?? "";

  // Mulank — birth date (day of month) reduced.
  const mulankNum = reduceToSingleDigit(day);

  // Bhagyank — day, month, year each reduced, then summed and reduced.
  const bhagyankNum = reduceToSingleDigit(
    reduceToSingleDigit(day) +
      reduceToSingleDigit(month) +
      reduceToSingleDigit(year)
  );

  // Name number — Chaldean values of the FIRST name reduced.
  const nameNum = nameNumberOf(firstName);

  return {
    input: { fullName, firstName, day, month, year },
    mulank: withPlanet(mulankNum),
    bhagyank: withPlanet(bhagyankNum),
    nameNumber: withPlanet(nameNum),
    loShu: loShuGrid(day, month, year),
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function withPlanet(number: Digit): { number: Digit; planet: Planet } {
  return { number, planet: PLANET_BY_NUMBER[number] };
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}
