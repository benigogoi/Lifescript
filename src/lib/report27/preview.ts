/**
 * Live preview pages for the report offer: four real pages of the 27-page
 * report built from the visitor's own name and date of birth. Every number,
 * grid and list on them is genuinely theirs; each AI-written personal
 * paragraph is replaced by a blurred, locked block. Nothing is invented, no
 * Claude call is made, and nothing is stored — the locked readings are what
 * the purchase pays for.
 */
import type { ReportOptions } from "../report-template";
import { nextMonths } from "./calc";
import type { Report27Content } from "./content-engine";
import { PERSONAL_MONTH } from "./data";
import { buildReport27Html } from "./template";

export const PREVIEW_PAGE_IDS = ["name-align", "money", "compat", "months"] as const;
export type PreviewPageId = (typeof PREVIEW_PAGE_IDS)[number];

export interface ReportPreview {
  /** Font link + report styles, sent once and shared by every page. */
  head: string;
  pages: { id: PreviewPageId; html: string }[];
}

const LOCK = "__MD_LOCKED__";

// Deliberately generic: the blurred text is visible in the page source, so it
// must say nothing about the person.
const DECOY =
  "Your personal reading for this page is written from your own name and date of birth, connecting these numbers to your life, your choices and the months ahead in real detail.";

const lockedBlock = (repeats: number) =>
  `<span class="locked-text">${Array.from({ length: repeats }, () => DECOY).join(" ")}</span><span class="locked-pill">&#128274; Unlocks in your full report</span>`;

// Full paragraphs fill their space like a real reading would; month notes are short.
const LOCKED_PARAGRAPH = lockedBlock(5);
const LOCKED_NOTE = lockedBlock(2);

const LOCK_CSS = `
  .locked { position:relative; }
  .locked-text { display:block; filter:blur(6px); opacity:0.75; user-select:none; }
  .locked-pill { position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); white-space:nowrap; font-family:'Marcellus', serif; font-size:17px; letter-spacing:0.5px; color:#0D0D12; background:linear-gradient(180deg, #E6C766, #C9A84C); padding:9px 20px; border-radius:22px; box-shadow:0 0 28px rgba(201,168,76,0.4); }
  .mc-focus.locked .locked-pill { font-size:14px; padding:6px 14px; }
`;

export function buildReportPreview(opts: ReportOptions): ReportPreview {
  const now = opts.preparedDate ?? new Date();

  const content: Report27Content = {
    welcome: LOCK,
    mulankCombo: LOCK,
    bhagyankCombo: LOCK,
    nameCombo: LOCK,
    together: LOCK,
    nameVerdict: LOCK,
    loshuCombo: LOCK,
    planes: LOCK,
    missing: LOCK,
    repeated: LOCK,
    career: LOCK,
    money: LOCK,
    love: LOCK,
    compatibility: LOCK,
    health: LOCK,
    year1Combo: LOCK,
    year2Combo: LOCK,
    personalYear: LOCK,
    // Month titles come from the static personal-month themes, so they stay readable.
    months: nextMonths(now, opts.day, opts.month).map((mo) => ({
      theme: `A Month to ${PERSONAL_MONTH[mo.personalMonth].theme}`,
      focus: LOCK,
    })),
    luckyCombo: LOCK,
    remedyCombo: LOCK,
    actions: Array.from({ length: 5 }, () => ({ title: LOCK, detail: LOCK })),
    thankyou: LOCK,
  };

  const html = buildReport27Html({ ...opts, preparedDate: now }, content);
  const fonts = html.match(/<link href="https:\/\/fonts\.googleapis\.com[^>]*>/)?.[0] ?? "";
  const styles = html.match(/<style>[\s\S]*?<\/style>/)?.[0] ?? "";

  return {
    head: `${fonts}${styles}<style>${LOCK_CSS}</style>`,
    pages: PREVIEW_PAGE_IDS.map((id) => ({
      id,
      html: lockSection(html.match(new RegExp(`<section class="page" id="${id}">[\\s\\S]*?</section>`))?.[0] ?? ""),
    })),
  };
}

function lockSection(section: string): string {
  return section
    .replace(/<p(?: class="lead")?>__MD_LOCKED__<\/p>/g, `<p class="locked">${LOCKED_PARAGRAPH}</p>`)
    .replace(/<div class="mc-focus">__MD_LOCKED__<\/div>/g, `<div class="mc-focus locked">${LOCKED_NOTE}</div>`)
    .replaceAll(LOCK, "");
}
