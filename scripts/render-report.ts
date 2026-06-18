/**
 * Renders report/preview.html with headless Chrome.
 * - PNG per `.page` element  -> report/out/*.png  (for visual review)
 * - Full multi-page PDF       -> report/out/report.pdf
 *
 * Uses the locally cached chrome-headless-shell (or CHROME_PATH override).
 */
import puppeteer from "puppeteer";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = path.resolve(__dirname, "..");
const HTML = path.join(ROOT, "report", "preview.html");
const OUT = path.join(ROOT, "report", "out");

const SHELL =
  process.env.CHROME_PATH ||
  "C:/Users/benig/.cache/puppeteer/chrome-headless-shell/win64-149.0.7827.22/chrome-headless-shell-win64/chrome-headless-shell.exe";
const SYSTEM_CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";

function resolveBrowser(): string {
  if (existsSync(SHELL)) return SHELL;
  if (existsSync(SYSTEM_CHROME)) return SYSTEM_CHROME;
  throw new Error("No Chrome found. Set CHROME_PATH.");
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: resolveBrowser(),
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--force-color-profile=srgb"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });
  await page.goto(pathToFileURL(HTML).href, { waitUntil: "networkidle0" });
  await page.evaluateHandle("document.fonts.ready");

  const ids = await page.$$eval(".page", (els) => els.map((e) => e.id));
  for (const id of ids) {
    const el = await page.$(`#${id}`);
    if (!el) continue;
    const file = path.join(OUT, `${id}.png`);
    await el.screenshot({ path: file as `${string}.png` });
    console.log("PNG  ->", file);
  }

  await page.pdf({
    path: path.join(OUT, "report.pdf"),
    width: "794px",
    height: "1123px",
    printBackground: true,
    pageRanges: "",
  });
  console.log("PDF  ->", path.join(OUT, "report.pdf"));

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
