/**
 * Renders selected report pages as optimized WebP images for the
 * "See a sample report" section on the landing page.
 * Output -> public/samples/sample-<id>.webp
 *
 * Run: CHROME_PATH="C:/Program Files/Google/Chrome/Application/chrome.exe" npx tsx scripts/render-samples.ts
 */
import puppeteer from "puppeteer";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { buildReportHtml, type ReportOptions } from "../src/lib/report-template";

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "public", "samples");
const TMP = path.join(ROOT, "report", "out");

const SYSTEM_CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
function resolveBrowser(): string {
  const p = process.env.CHROME_PATH || SYSTEM_CHROME;
  if (!existsSync(p)) throw new Error(`Chrome not found at ${p}. Set CHROME_PATH.`);
  return p;
}

// Fictional sample customer shown publicly on the landing page.
const SAMPLE: ReportOptions = {
  fullName: "Ananya Sharma",
  day: 21,
  month: 6,
  year: 1994,
  year1: 2026,
  year2: 2027,
};

const PAGES = ["cover", "loshu", "lucky"];

async function main() {
  await mkdir(OUT, { recursive: true });
  await mkdir(TMP, { recursive: true });

  const html = buildReportHtml(SAMPLE);
  const htmlPath = path.join(TMP, "gen-sample.html");
  await writeFile(htmlPath, html, "utf8");

  const browser = await puppeteer.launch({
    executablePath: resolveBrowser(),
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--force-color-profile=srgb"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1.5 });
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle0" });
  await page.evaluateHandle("document.fonts.ready");

  for (const id of PAGES) {
    const el = await page.$(`#${id}`);
    if (!el) {
      console.warn(`page #${id} not found, skipping`);
      continue;
    }
    const file = path.join(OUT, `sample-${id}.webp`);
    await el.screenshot({ path: file as `${string}.webp`, type: "webp", quality: 82 });
    console.log("WebP ->", file);
  }

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
