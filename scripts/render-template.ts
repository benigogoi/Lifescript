/**
 * Generates report HTML from the data-driven template (no static preview)
 * and renders it with headless Chrome. Proves the engine -> template -> PDF
 * path works for arbitrary customers.
 */
import puppeteer from "puppeteer";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { buildReportHtml, type ReportOptions } from "../src/lib/report-template";

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "report", "out");

const SYSTEM_CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
function resolveBrowser(): string {
  const p = process.env.CHROME_PATH || SYSTEM_CHROME;
  if (!existsSync(p)) throw new Error(`Chrome not found at ${p}. Set CHROME_PATH.`);
  return p;
}

const customers: { slug: string; full: boolean; opts: ReportOptions }[] = [
  { slug: "ravi", full: true, opts: { fullName: "Ravi Kumar", day: 28, month: 8, year: 1995, year1: 2026, year2: 2027 } },
  { slug: "priya", full: false, opts: { fullName: "Priya Sharma", day: 5, month: 11, year: 1992, year1: 2026, year2: 2027 } },
];

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: resolveBrowser(),
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--force-color-profile=srgb"],
  });

  for (const c of customers) {
    const html = buildReportHtml(c.opts);
    const htmlPath = path.join(OUT, `gen-${c.slug}.html`);
    await writeFile(htmlPath, html, "utf8");

    const page = await browser.newPage();
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle0" });
    await page.evaluateHandle("document.fonts.ready");

    const ids = await page.$$eval(".page", (els) => els.map((e) => e.id));
    const targets = c.full ? ids : ["cover", "loshu"];
    for (const id of targets) {
      const el = await page.$(`#${id}`);
      if (!el) continue;
      const file = path.join(OUT, `${c.slug}-${id}.png`);
      await el.screenshot({ path: file as `${string}.png` });
      console.log("PNG  ->", file);
    }
    await page.pdf({
      path: path.join(OUT, `${c.slug}.pdf`),
      width: "794px",
      height: "1123px",
      printBackground: true,
    });
    console.log("PDF  ->", path.join(OUT, `${c.slug}.pdf`));
    await page.close();
  }

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
