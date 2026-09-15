/**
 * renders the 27-page test report.
 *
 *   npx tsx scripts/render-report27.ts --name "Full Name" --dob 28-08-1995
 *   npx tsx scripts/render-report27.ts --no-ai      # layout check, no API call
 *
 * Output goes to report/out/report27/: the PDF, the HTML, a PNG of every page,
 * and (with AI) content.json including the exact token usage and cost.
 */
import puppeteer from "puppeteer";
import { existsSync, readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { reportFileName, type ReportOptions } from "../src/lib/report-template";
import { buildReport27Html } from "../src/lib/report27/template";
import {
  COST_CAP_INR,
  REPORT27_MODEL,
  generateReport27Content,
  placeholderReport27Content,
  type Report27Content,
} from "../src/lib/report27/content-engine";

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "report", "out", "report27");
const SYSTEM_CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";

const ENV_FILE = path.join(ROOT, ".env.local");
if (existsSync(ENV_FILE)) process.loadEnvFile(ENV_FILE);

function arg(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function main() {
  const noAi = process.argv.includes("--no-ai");
  const fullName = arg("--name") ?? "Ananya Sharma";
  const dob = arg("--dob") ?? "21-06-1994";
  const [day, month, year] = dob.split(/[-/.]/).map(Number);
  if (!day || !month || !year) throw new Error(`Bad --dob "${dob}" — expected DD-MM-YYYY`);

  const customer: ReportOptions = { fullName, day, month, year, year1: 2026, year2: 2027, preparedDate: new Date() };
  await mkdir(path.join(OUT, "pages"), { recursive: true });

  let content: Report27Content;
  if (noAi) {
    content = placeholderReport27Content();
    console.log("Layout check — worst-case placeholder text, no API call.");
  } else {
    if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is not set (.env.local).");
    console.log(`Generating with ${REPORT27_MODEL}, hard cap ₹${COST_CAP_INR}…`);
    const g = await generateReport27Content(customer);
    content = g.content;
    console.log(
      `Claude: ${g.inputTokens} in / ${g.outputTokens} out (max_tokens ${g.maxTokens}) → $${g.costUsd.toFixed(4)} ≈ ₹${g.costInr.toFixed(2)}`,
    );
    await writeFile(path.join(OUT, "content.json"), JSON.stringify(g, null, 2), "utf8");
  }

  const slug = reportFileName(fullName).replace(/\.pdf$/, "");
  const htmlPath = path.join(OUT, `${slug}.html`);
  await writeFile(htmlPath, buildReport27Html(customer, content), "utf8");

  const executablePath = process.env.CHROME_PATH || SYSTEM_CHROME;
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--force-color-profile=srgb"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle0" });
  await page.evaluateHandle("document.fonts.ready");
  await new Promise((resolve) => setTimeout(resolve, 600));

  // Fit report: content running into the footer zone, clipped body copy, and
  // body copy the safety net had to shrink below its 17.5px default.
  const fit = await page.evaluate(() =>
    Array.from(document.querySelectorAll("section.page")).map((s, i) => {
      const box = s.getBoundingClientRect();
      const inner = s.querySelector(".content-inner");
      let overflowPx = 0;
      if (inner) {
        const bottoms = Array.from(inner.children).map((k) => k.getBoundingClientRect().bottom);
        overflowPx = Math.round(Math.max(...bottoms) - (box.bottom - 80));
      }
      const copies = Array.from(s.querySelectorAll<HTMLElement>(".body-copy"));
      return {
        page: i + 1,
        id: s.id,
        overflowPx,
        clipped: copies.filter((b) => b.scrollHeight > b.clientHeight + 1).length,
        minFont: copies.length ? Math.min(...copies.map((b) => parseFloat(getComputedStyle(b).fontSize))) : null,
      };
    }),
  );

  const sections = await page.$$("section.page");
  for (const [i, el] of sections.entries()) {
    const id = await el.evaluate((n) => n.id);
    await el.screenshot({ path: path.join(OUT, "pages", `${String(i + 1).padStart(2, "0")}-${id}.png`) as `${string}.png` });
  }

  const pdfPath = path.join(OUT, `${slug}.pdf`);
  await page.pdf({ path: pdfPath, width: "794px", height: "1123px", printBackground: true, preferCSSPageSize: true });
  await browser.close();

  const pdf = readFileSync(pdfPath);
  const pdfPages = (pdf.toString("latin1").match(/\/Type\s*\/Page[^s]/g) ?? []).length;

  const problems = fit.filter((f) => f.overflowPx > 0 || f.clipped > 0 || (f.minFont !== null && f.minFont < 17));
  console.log(`\nSections: ${sections.length} · PDF pages: ${pdfPages} · PDF size: ${(pdf.length / 1024 / 1024).toFixed(2)} MB`);
  if (problems.length) {
    console.log("Pages needing attention:");
    console.table(problems);
  } else {
    console.log("All pages fit.");
  }
  console.log(`PDF  -> ${pdfPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
