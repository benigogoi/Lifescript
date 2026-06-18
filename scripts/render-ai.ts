/**
 * Generates a report with REAL Claude-written content, then renders it.
 * Requires ANTHROPIC_API_KEY in the environment.
 *
 *   ANTHROPIC_API_KEY=sk-ant-... \
 *   CHROME_PATH="C:/Program Files/Google/Chrome/Application/chrome.exe" \
 *   npx tsx scripts/render-ai.ts
 *
 * Falls back to static content (and says so) if the API call fails.
 */
import puppeteer from "puppeteer";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { buildReportHtml, reportFileName, staticContent, type ReportOptions } from "../src/lib/report-template";
import { generateReportContent } from "../src/lib/content-engine";
import { calculateNumerology } from "../src/lib/numerology";

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "report", "out");
const SYSTEM_CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";

// Load secrets from .env.local (ANTHROPIC_API_KEY) if present.
const ENV_FILE = path.join(ROOT, ".env.local");
if (existsSync(ENV_FILE)) {
  try {
    process.loadEnvFile(ENV_FILE);
  } catch {
    /* Node < 20.12 — env must be set in the shell instead */
  }
}

function browserPath(): string {
  const p = process.env.CHROME_PATH || SYSTEM_CHROME;
  if (!existsSync(p)) throw new Error(`Chrome not found at ${p}. Set CHROME_PATH.`);
  return p;
}

const customer: ReportOptions = {
  fullName: "Ravi Kumar",
  day: 28,
  month: 8,
  year: 1995,
  year1: 2026,
  year2: 2027,
};

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY is not set. Set it to generate real content:\n");
    console.error('  ANTHROPIC_API_KEY=sk-ant-... npx tsx scripts/render-ai.ts\n');
    process.exit(1);
  }

  await mkdir(OUT, { recursive: true });

  console.log("Generating content with Claude…");
  let content;
  try {
    content = await generateReportContent(customer);
    console.log("✅ Claude content generated.");
  } catch (e) {
    console.error("⚠️  Content generation failed, using static fallback:", (e as Error).message);
    content = staticContent(calculateNumerology(customer), customer.year1!, customer.year2!);
  }

  const html = buildReportHtml(customer, content);
  const htmlPath = path.join(OUT, "ai-ravi.html");
  await writeFile(htmlPath, html, "utf8");

  const browser = await puppeteer.launch({
    executablePath: browserPath(),
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--force-color-profile=srgb"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle0" });
  await page.evaluateHandle("document.fonts.ready");

  for (const id of ["mulank", "bhagyank", "year1"]) {
    const el = await page.$(`#${id}`);
    if (el) {
      const file = path.join(OUT, `ai-${id}.png`);
      await el.screenshot({ path: file as `${string}.png` });
      console.log("PNG  ->", file);
    }
  }

  const pdfPath = path.join(OUT, reportFileName(customer.fullName));
  await page.pdf({ path: pdfPath, width: "794px", height: "1123px", printBackground: true });
  console.log("PDF  ->", pdfPath);

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
