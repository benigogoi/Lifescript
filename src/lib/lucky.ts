/**
 * Lucky elements — colours, days, gemstone, metal and direction for each Mulank.
 *
 * Split out of report-data.ts on purpose: the free calculator shows a visitor
 * their own lucky elements in the browser, and importing the full report-data
 * module would drag ~55KB of report prose (NUMBER_CORE, YEAR_CORE, REMEDIES)
 * into the client bundle for a table worth a couple of KB. report-data.ts
 * re-exports these so existing server-side imports keep working unchanged.
 */
import type { Digit } from "./numerology";

export interface LuckyColor {
  name: string;
  hex: string;
}
export interface Lucky {
  days: string;
  colors: LuckyColor[];
  numbers: string;
  gemstone: string;
  metal: string;
  direction: string;
}

export const LUCKY: Record<Digit, Lucky> = {
  1: { days: "Sunday & Monday", colors: [{ name: "Gold", hex: "#E6C766" }, { name: "Orange", hex: "#E08A3C" }, { name: "Yellow", hex: "#EBD55A" }], numbers: "1, 3 & 9", gemstone: "Ruby · Manik", metal: "Gold & Copper", direction: "East" },
  2: { days: "Monday & Friday", colors: [{ name: "White", hex: "#F0F0F5" }, { name: "Cream", hex: "#EDE6D0" }, { name: "Silver", hex: "#C8CCD4" }], numbers: "2, 7 & 9", gemstone: "Pearl · Moti", metal: "Silver", direction: "North-West" },
  3: { days: "Thursday", colors: [{ name: "Yellow", hex: "#EBD55A" }, { name: "Gold", hex: "#E6C766" }, { name: "Saffron", hex: "#E89A3C" }], numbers: "3, 6 & 9", gemstone: "Yellow Sapphire · Pukhraj", metal: "Gold", direction: "North-East" },
  4: { days: "Saturday & Sunday", colors: [{ name: "Grey", hex: "#9AA0A8" }, { name: "Blue", hex: "#5B7FA6" }, { name: "Khaki", hex: "#B7A77E" }], numbers: "4, 8 & 1", gemstone: "Hessonite · Gomed", metal: "Mixed alloys", direction: "South-West" },
  5: { days: "Wednesday", colors: [{ name: "Green", hex: "#5BA877" }, { name: "Turquoise", hex: "#4FB3B0" }, { name: "Light Grey", hex: "#C2C6CC" }], numbers: "5 & 6", gemstone: "Emerald · Panna", metal: "Bronze & Brass", direction: "North" },
  6: { days: "Friday", colors: [{ name: "White", hex: "#F0F0F5" }, { name: "Pink", hex: "#E59BB0" }, { name: "Pastel Blue", hex: "#A9C7E0" }], numbers: "6, 5 & 9", gemstone: "Diamond · Heera", metal: "Silver & Platinum", direction: "South-East" },
  7: { days: "Monday & Sunday", colors: [{ name: "Smoky Grey", hex: "#8A8A94" }, { name: "Sea Green", hex: "#5FA28C" }, { name: "White", hex: "#F0F0F5" }], numbers: "7 & 2", gemstone: "Cat's Eye · Lehsunia", metal: "Mixed alloys", direction: "North-East" },
  8: { days: "Saturday", colors: [{ name: "Black", hex: "#3A3A42" }, { name: "Dark Blue", hex: "#33456B" }, { name: "Deep Grey", hex: "#6E6E78" }], numbers: "8 & 4", gemstone: "Blue Sapphire · Neelam", metal: "Iron & Steel", direction: "West" },
  9: { days: "Tuesday", colors: [{ name: "Red", hex: "#D9534F" }, { name: "Coral", hex: "#E0775C" }, { name: "Crimson", hex: "#B23A48" }], numbers: "9, 3 & 6", gemstone: "Red Coral · Moonga", metal: "Copper", direction: "South" },
};
