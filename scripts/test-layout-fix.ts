/**
 * Layout-only check: re-render a page with the static knowledge base content
 * plus the actual long combo paragraph that caused the panel/footer overlap
 * (copied from the customer's real report), to confirm the CSS fix without
 * spending another Claude API call.
 *
 *   npx tsx scripts/test-layout-fix.ts
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { buildReportHtml, staticContent, type ReportOptions } from "../src/lib/report-template";
import { calculateNumerology } from "../src/lib/numerology";

const opts: ReportOptions = {
  fullName: "Beni MadhabG Gogoi",
  day: 28,
  month: 1,
  year: 1992,
  year1: 2026,
  year2: 2027,
};

const LONG_COMBO =
  "Your Mulank 1, ruled by the Sun, gives you a natural authority and a drive to lead — " +
  "but what makes your chart especially interesting is how this solar confidence meets the " +
  "restless intelligence of Mercury (your Bhagyank 5) and the unconventional energy of " +
  "Rahu (your Name Number 4). The Sun in you wants to stand firm and command, yet " +
  "Mercury keeps nudging you toward change, curiosity, and new horizons, creating a " +
  "personality that is both decisive and wonderfully adaptable. Your Lo Shu amplifies this " +
  "tension beautifully: with 1 appearing twice, your sense of self and willpower is doubly " +
  "reinforced, yet the wide cluster of missing numbers (3 through 7) means you are still " +
  "growing into expression, creativity, and emotional range — areas where your Sun-" +
  "ruled core will keep pulling you forward with courage rather than retreat.";

async function main() {
  const r = calculateNumerology(opts);
  const base = staticContent(r, opts.year1!, opts.year2!);
  const content = {
    ...base,
    mulank: { ...base.mulank, paras: [...base.mulank.paras, LONG_COMBO] },
  };

  const html = buildReportHtml(opts, content);
  const out = path.resolve(__dirname, "..", "report", "out", "layout-fix-check.html");
  await writeFile(out, html, "utf8");
  console.log(`Wrote ${out}`);
}

main();
