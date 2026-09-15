/**
 * Renders the sample pages shown in the report offer (src/components/ReportOffer.tsx):
 * the four pages of the 27-page report most likely to make a visitor want
 * their own. Output -> public/samples/sample27-<id>.webp
 *
 * The personal paragraphs need one Claude call (~₹6.5) for the fictional
 * sample customer; the result is cached in report/out/samples27-content.json,
 * so re-rendering after a design tweak costs nothing. Delete the cache to
 * regenerate the text.
 *
 * Run: CHROME_PATH="C:/Program Files/Google/Chrome/Application/chrome.exe" npx tsx scripts/render-samples-27.ts
 */
import puppeteer from "puppeteer";
import { existsSync, readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { ReportOptions } from "../src/lib/report-template";
import { buildReport27Html } from "../src/lib/report27/template";
import { generateReport27Content, type Report27Content } from "../src/lib/report27/content-engine";

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "public", "samples");
const TMP = path.join(ROOT, "report", "out");
const CACHE = path.join(TMP, "samples27-content.json");
const SYSTEM_CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";

const ENV_FILE = path.join(ROOT, ".env.local");
if (existsSync(ENV_FILE)) process.loadEnvFile(ENV_FILE);

// Fictional sample customer shown publicly (same person as the original samples).
const SAMPLE: ReportOptions = {
  fullName: "Ananya Sharma",
  day: 21,
  month: 6,
  year: 1994,
  year1: 2026,
  year2: 2027,
  preparedDate: new Date("2026-09-15T09:00:00+05:30"),
};

const PAGES = ["name-align", "money", "compat", "months"];

async function main() {
  await mkdir(OUT, { recursive: true });
  await mkdir(TMP, { recursive: true });

  let content: Report27Content;
  if (existsSync(CACHE)) {
    content = JSON.parse(readFileSync(CACHE, "utf8")) as Report27Content;
    console.log("Using cached sample content (no API call).");
  } else {
    const generated = await generateReport27Content(SAMPLE);
    content = generated.content;
    await writeFile(CACHE, JSON.stringify(content, null, 2), "utf8");
    console.log(`Generated sample content — ≈₹${generated.costInr.toFixed(2)}`);
  }

  const htmlPath = path.join(TMP, "samples27.html");
  await writeFile(htmlPath, buildReport27Html(SAMPLE, content), "utf8");

  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME_PATH || SYSTEM_CHROME,
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--force-color-profile=srgb"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1.5 });
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle0" });
  await page.evaluateHandle("document.fonts.ready");
  await new Promise((resolve) => setTimeout(resolve, 500));

  for (const id of PAGES) {
    const el = await page.$(`#${id}`);
    if (!el) throw new Error(`page #${id} not found`);
    const file = path.join(OUT, `sample27-${id}.webp`);
    await el.screenshot({ path: file as `${string}.webp`, type: "webp", quality: 82 });
    console.log("WebP ->", file);
  }

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
