/**
 * LifeScript — report generation + delivery.
 *
 * Server-only. Takes a paid order through: generating → ready → sent.
 *
 * STUB (current): the report is built from the static knowledge base only
 * (no Claude), so we can test the full pipeline — render, storage, delivery —
 * without spending API credits. To go live, swap `buildReportHtml(opts)` for
 * `buildReportHtml(opts, await generateReportContent(opts))`.
 *
 * TESTING vs PRODUCTION: this runs generation + delivery immediately. Production
 * will move this to a decoupled background worker with the randomized 6–18h
 * delay and a webhook backstop (see delivery-architecture decisions).
 */
import "server-only";
import puppeteer from "puppeteer";
import { existsSync } from "node:fs";
import { buildReportHtml, reportFileName, type ReportOptions } from "./report-template";
import { supabaseAdmin, REPORTS_BUCKET } from "./supabase";
import { updateOrder, type Order } from "./orders";
import { sendReportReady } from "./email";

const SYSTEM_CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";

function browserPath(): string {
  const p = process.env.CHROME_PATH || SYSTEM_CHROME;
  if (!existsSync(p)) {
    throw new Error(`Chrome not found at ${p}. Set CHROME_PATH in .env.local.`);
  }
  return p;
}

/** Render the report HTML to a PDF buffer with headless system Chrome. */
async function renderPdf(html: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    executablePath: browserPath(),
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--force-color-profile=srgb"],
  });
  try {
    const page = await browser.newPage();
    // deviceScaleFactor has no effect on page.pdf() output size or quality
    // (verified) — keep it at 1 so generation is a touch faster.
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1 });
    await page.setContent(html, { waitUntil: "load" });
    // Ensure the Google Fonts (loaded via <link>) are fully ready before snapshot.
    await page.evaluateHandle("document.fonts.ready");
    await page.waitForNetworkIdle({ idleTime: 400 }).catch(() => {});
    const pdf = await page.pdf({ width: "794px", height: "1123px", printBackground: true });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

function reportOptionsFor(order: Order): ReportOptions {
  const year1 = new Date().getFullYear();
  return {
    fullName: order.full_name,
    day: order.dob_day,
    month: order.dob_month,
    year: order.dob_year,
    year1,
    year2: year1 + 1,
  };
}

/**
 * Generate, store, and deliver the report for a paid order.
 * Self-contained: manages status transitions and never throws (errors land the
 * order in 'failed' with a message, so the cron/admin can see and retry).
 */
export async function processPaidOrder(order: Order): Promise<void> {
  try {
    await updateOrder(order.id, { status: "generating" });

    // --- generate (STUB: static content, no Claude) ---
    const html = buildReportHtml(reportOptionsFor(order));
    const pdf = await renderPdf(html);
    // TODO(production): compress the PDF here (~1.65MB → ~500KB, Ghostscript-class)
    // before storing/emailing. Decided to compress at deploy rather than degrade
    // the design; deviceScaleFactor and CSS-background trims don't meaningfully help.

    // --- store the PDF in the private 'reports' bucket ---
    const filename = reportFileName(order.full_name);
    const pdfPath = `${order.id}/${filename}`;
    const { error: upErr } = await supabaseAdmin()
      .storage.from(REPORTS_BUCKET)
      .upload(pdfPath, pdf, { contentType: "application/pdf", upsert: true });
    if (upErr) throw upErr;

    await updateOrder(order.id, { status: "ready", pdf_path: pdfPath });

    // --- deliver (immediate for testing; production adds the randomized delay) ---
    await sendReportReady({
      to: order.email,
      firstName: order.full_name.split(/\s+/)[0] ?? order.full_name,
      pdf,
      filename,
    });

    await updateOrder(order.id, { status: "sent", sent_at: new Date().toISOString() });
    console.log(`order ${order.id}: report generated + delivered to ${order.email}`);
  } catch (e) {
    console.error(`order ${order.id}: processing failed`, e);
    await updateOrder(order.id, {
      status: "failed",
      error: e instanceof Error ? e.message : String(e),
    }).catch(() => {});
  }
}
