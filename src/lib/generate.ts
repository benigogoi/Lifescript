/**
 * LifeScript — report generation + delivery.
 *
 * Server-only. Takes a paid order through: generating → ready → scheduled → sent.
 *
 * Content: uses the Claude content engine (generateReportContent) for the
 * personalised combination paragraphs, falling back to the static knowledge
 * base (staticContent, via buildReportHtml(opts)) if Claude errors — a report
 * must still go out even if the API call fails.
 *
 * Delivery: generation happens immediately on payment; the actual send is
 * delayed by a randomized 6–18h window (daytime hours only) and performed by
 * the delivery cron (see app/api/cron/deliver/route.ts), not inline here.
 */
import "server-only";
import puppeteer from "puppeteer-core";
import { existsSync } from "node:fs";
import { buildReportHtml, reportFileName, type ReportOptions } from "./report-template";
import { generateReportContent } from "./content-engine";
import { supabaseAdmin, REPORTS_BUCKET } from "./supabase";
import { updateOrder, type Order } from "./orders";
import { scheduleDelayedDelivery } from "./scheduling";
import { sendReportReady } from "./email";

const SYSTEM_CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";

/** On Vercel (no system Chrome available) we launch @sparticuz/chromium's bundled binary. */
async function launchBrowser() {
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const chromium = (await import("@sparticuz/chromium")).default;
    return puppeteer.launch({
      executablePath: await chromium.executablePath(),
      args: chromium.args,
      headless: true,
    });
  }

  const localPath = process.env.CHROME_PATH || SYSTEM_CHROME;
  if (!existsSync(localPath)) {
    throw new Error(`Chrome not found at ${localPath}. Set CHROME_PATH in .env.local.`);
  }
  return puppeteer.launch({
    executablePath: localPath,
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--force-color-profile=srgb"],
  });
}

/** Render the report HTML to a PDF buffer with headless Chrome/Chromium. */
async function renderPdf(html: string): Promise<Buffer> {
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    // deviceScaleFactor has no effect on page.pdf() output size or quality
    // (verified) — keep it at 1 so generation is a touch faster.
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1 });
    await page.setContent(html, { waitUntil: "load" });
    // Ensure the Google Fonts (loaded via <link>) are fully ready before snapshot.
    await page.evaluateHandle("document.fonts.ready");
    await page.waitForNetworkIdle({ idleTime: 400 }).catch(() => {});
    await page.evaluate(fitBodyCopySource);
    const pdf = await page.pdf({ width: "794px", height: "1123px", printBackground: true });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

/**
 * Some Claude-written combination paragraphs run longer than the static
 * baseline, which can overflow the fixed-height page and clip text (or, pre-
 * flexbox-fix, push panels into the footer). Shrink only the offending
 * page's body copy until it fits, rather than truncating content.
 */
const fitBodyCopySource = `
  document.querySelectorAll('.body-copy').forEach((el) => {
    let fontSize = parseFloat(getComputedStyle(el).fontSize);
    let guard = 0;
    while (el.scrollHeight > el.clientHeight && fontSize > 13 && guard < 12) {
      fontSize -= 0.5;
      el.style.fontSize = fontSize + 'px';
      guard++;
    }
  });
`;

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
 * Generate and store the report PDF for a paid order, then schedule its
 * (randomly delayed) delivery. Self-contained: manages status transitions and
 * never throws (errors land the order in 'failed' with a message, so the
 * cron/admin can see and retry).
 */
export async function processPaidOrder(order: Order): Promise<void> {
  try {
    await updateOrder(order.id, { status: "generating" });

    const opts = reportOptionsFor(order);
    let html: string;
    try {
      const content = await generateReportContent(opts);
      html = buildReportHtml(opts, content);
    } catch (e) {
      console.error(`order ${order.id}: Claude content generation failed, falling back to static`, e);
      html = buildReportHtml(opts);
    }

    const pdf = await renderPdf(html);

    // --- store the PDF in the private 'reports' bucket ---
    const filename = reportFileName(order.full_name);
    const pdfPath = `${order.id}/${filename}`;
    const { error: upErr } = await supabaseAdmin()
      .storage.from(REPORTS_BUCKET)
      .upload(pdfPath, pdf, { contentType: "application/pdf", upsert: true });
    if (upErr) throw upErr;

    // --- schedule delivery for a randomized 6–18h (daytime-only) delay ---
    const scheduledAt = scheduleDelayedDelivery();
    await updateOrder(order.id, {
      status: "scheduled",
      pdf_path: pdfPath,
      scheduled_at: scheduledAt.toISOString(),
      error: null,
    });
    console.log(`order ${order.id}: report ready, scheduled to send at ${scheduledAt.toISOString()}`);
  } catch (e) {
    console.error(`order ${order.id}: processing failed`, e);
    await updateOrder(order.id, {
      status: "failed",
      error: e instanceof Error ? e.message : String(e),
    }).catch(() => {});
  }
}

/**
 * Send the already-generated report PDF for a 'scheduled' order. Called by
 * the delivery cron once `scheduled_at` has passed, and by the admin panel's
 * "send now" override. Never throws — failures land the order in 'failed'.
 */
export async function deliverScheduledOrder(order: Order): Promise<void> {
  if (!order.pdf_path) {
    console.error(`order ${order.id}: cannot deliver, no pdf_path`);
    await updateOrder(order.id, { status: "failed", error: "Missing pdf_path at delivery time." });
    return;
  }
  try {
    const { data, error: dlErr } = await supabaseAdmin()
      .storage.from(REPORTS_BUCKET)
      .download(order.pdf_path);
    if (dlErr) throw dlErr;
    const pdf = Buffer.from(await data.arrayBuffer());
    const filename = order.pdf_path.split("/").pop() ?? reportFileName(order.full_name);

    await sendReportReady({
      to: order.email,
      firstName: order.full_name.split(/\s+/)[0] ?? order.full_name,
      pdf,
      filename,
    });

    await updateOrder(order.id, { status: "sent", sent_at: new Date().toISOString(), error: null });
    console.log(`order ${order.id}: delivered to ${order.email}`);
  } catch (e) {
    console.error(`order ${order.id}: delivery failed`, e);
    await updateOrder(order.id, {
      status: "failed",
      error: e instanceof Error ? e.message : String(e),
    }).catch(() => {});
  }
}
