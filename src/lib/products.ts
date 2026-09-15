/**
 * Mystic Digits — the product catalogue.
 *
 * Today exactly one product is sellable: the personal numerology report. This
 * registry exists so the others can be switched on later without reworking
 * checkout, the orders table or the admin panel.
 *
 * The seam is the existing `orders.tier` column (text, default 'numerology'),
 * so adding a product is a new entry here plus its own report template — not a
 * schema migration. `numerology` keeps its historical id so every existing row
 * still resolves.
 *
 * Nothing here is live until `sellable: true` AND checkout is wired to accept a
 * product id. Do not flip a flag and assume it works end to end.
 */
import { PRICE_INR } from "./pricing";

export type ProductId =
  | "numerology"        // Personal Numerology Report — the current live product
  | "child"             // Child Numerology Report
  | "gift"              // Gift Report (someone else is the subject)
  | "compatibility"     // Couple / Compatibility Report
  | "name-analysis"     // Name & Spelling Analysis
  | "year-ahead"        // Year-Ahead Report
  | "baby-naming";      // Baby Naming / Name Suggestion

export interface Product {
  id: ProductId;
  /** Customer-facing name. */
  name: string;
  /** One line describing what the buyer receives. */
  summary: string;
  /** Rupees. Only meaningful when `sellable` is true. */
  priceInr: number;
  /**
   * Whether the subject of the report is the buyer. Drives whose details the
   * form asks for — a gift or child report is about someone else, which the
   * current single-subject form cannot express yet.
   */
  subject: "self" | "other" | "pair";
  sellable: boolean;
}

export const PRODUCTS: Record<ProductId, Product> = {
  numerology: {
    id: "numerology",
    name: "Personal Numerology Report",
    summary: "Your complete 27-page Vedic numerology report, written from your name and date of birth.",
    priceInr: PRICE_INR,
    subject: "self",
    sellable: true,
  },
  child: {
    id: "child",
    name: "Child Numerology Report",
    summary: "A full reading for your child's name and date of birth.",
    priceInr: PRICE_INR,
    subject: "other",
    sellable: false,
  },
  gift: {
    id: "gift",
    name: "Gift Report",
    summary: "A complete report prepared for someone else, delivered to them or to you.",
    priceInr: PRICE_INR,
    subject: "other",
    sellable: false,
  },
  compatibility: {
    id: "compatibility",
    name: "Compatibility Report",
    summary: "How two charts work together — strengths, friction, and timing.",
    priceInr: PRICE_INR,
    subject: "pair",
    sellable: false,
  },
  "name-analysis": {
    id: "name-analysis",
    name: "Name & Spelling Analysis",
    summary: "Whether your name's number supports your birth numbers, and what spellings change.",
    priceInr: PRICE_INR,
    subject: "self",
    sellable: false,
  },
  "year-ahead": {
    id: "year-ahead",
    name: "Year-Ahead Report",
    summary: "A month-by-month reading of your personal year.",
    priceInr: PRICE_INR,
    subject: "self",
    sellable: false,
  },
  "baby-naming": {
    id: "baby-naming",
    name: "Baby Naming Report",
    summary: "Name directions that harmonise with your baby's date of birth.",
    priceInr: PRICE_INR,
    subject: "other",
    sellable: false,
  },
};

/** The product the funnel currently sells. */
export const DEFAULT_PRODUCT_ID: ProductId = "numerology";

export function getProduct(id: string): Product | undefined {
  return PRODUCTS[id as ProductId];
}

export function sellableProducts(): Product[] {
  return Object.values(PRODUCTS).filter((p) => p.sellable);
}
