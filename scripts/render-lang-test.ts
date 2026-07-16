/**
 * Language pipeline test — renders the SAME customer through the production
 * template in both languages:
 *   - English, static content (no API): regression check that the template
 *     refactor didn't change the English report.
 *   - Assamese, REAL content engine (needs ANTHROPIC_API_KEY): the full
 *     production path an Assamese order will take.
 *
 *   npx tsx scripts/render-lang-test.ts            # both
 *   npx tsx scripts/render-lang-test.ts en         # English regression only
 *   npx tsx scripts/render-lang-test.ts as         # Assamese API render only
 */
import puppeteer from "puppeteer";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { buildReportHtml, type ReportOptions } from "../src/lib/report-template";
import { generateReportContent } from "../src/lib/content-engine";

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "report", "out");
const SYSTEM_CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";

const ENV_FILE = path.join(ROOT, ".env.local");
if (existsSync(ENV_FILE)) {
  try {
    process.loadEnvFile(ENV_FILE);
  } catch {
    /* Node < 20.12 — env must be set in the shell instead */
  }
}

const customer: Omit<ReportOptions, "lang"> = {
  fullName: "Benimadhab Gogoi",
  day: 28,
  month: 1,
  year: 1992,
  year1: 2026,
  year2: 2027,
};

async function renderHtml(html: string, tag: string, pageIds: string[]) {
  const htmlPath = path.join(OUT, `langtest-${tag}.html`);
  await writeFile(htmlPath, html, "utf8");

  const chrome = process.env.CHROME_PATH || SYSTEM_CHROME;
  if (!existsSync(chrome)) throw new Error(`Chrome not found at ${chrome}. Set CHROME_PATH.`);
  const browser = await puppeteer.launch({
    executablePath: chrome,
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--force-color-profile=srgb"],
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle0" });
    await page.evaluateHandle("document.fonts.ready");
    await page.waitForNetworkIdle({ idleTime: 400 }).catch(() => {});

    for (const id of pageIds) {
      const el = await page.$(`#${id}`);
      if (el) {
        const file = path.join(OUT, `langtest-${tag}-${id}.png`);
        await el.screenshot({ path: file as `${string}.png` });
        console.log("PNG  ->", file);
      }
    }
    const pdfPath = path.join(OUT, `langtest-${tag}.pdf`);
    await page.pdf({ path: pdfPath, width: "794px", height: "1123px", printBackground: true });
    console.log("PDF  ->", pdfPath);
  } finally {
    await browser.close();
  }
}

async function main() {
  const which = process.argv[2] ?? "both";
  await mkdir(OUT, { recursive: true });

  if (which === "en" || which === "both") {
    console.log("— English (static, no API) —");
    const html = buildReportHtml({ ...customer, lang: "en" });
    await renderHtml(html, "en", ["cover", "mulank", "loshu", "year1", "remedies"]);
  }

  if (which === "as" || which === "both") {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error("ANTHROPIC_API_KEY is not set — cannot run the Assamese engine test.");
      process.exit(1);
    }
    console.log("— Assamese (real content engine) —");
    const opts: ReportOptions = { ...customer, lang: "as" };
    const { content, costUsd } = await generateReportContent(opts);
    console.log(`Engine cost: ~$${costUsd.toFixed(4)}`);
    console.log(`Transliterated name: ${content.display?.fullName ?? "(missing!)"}`);
    const html = buildReportHtml(opts, content);
    await renderHtml(html, "as", ["cover", "mulank", "bhagyank", "loshu", "namenum", "year1", "year2", "lucky", "remedies", "thankyou"]);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
