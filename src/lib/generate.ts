/**
 * Mystic Digits — report generation + delivery.
 *
 * Server-only. Takes a paid order through: generating → scheduled → sent.
 *
 * Content: English orders get the 27-page report (src/lib/report27), Assamese
 * keeps the 10-page report. There is deliberately no AI-free fallback for the
 * 27-page report — without its personal paragraphs it reads half-finished —
 * so a failed generation is retried, and if it still fails the order lands in
 * 'failed' and the owner is emailed to press Retry. Nothing broken ever
 * reaches a customer.
 *
 * Delivery: once the PDF is stored, AUTO_SEND_REPORTS=true sends it
 * immediately. Until then (the manual-review phase before the ₹5,000
 * milestone) the owner is emailed the PDF to review and sends it from the
 * admin panel.
 */
import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import puppeteer from "puppeteer-core";
import { existsSync } from "node:fs";
import { buildReportHtml, reportFileName, type ReportOptions } from "./report-template";
import { generateReportContent } from "./content-engine";
import { generateReport27Content } from "./report27/content-engine";
import { buildReport27Html } from "./report27/template";
import { supabaseAdmin, REPORTS_BUCKET } from "./supabase";
import { claimOrderForGeneration, updateOrder, type Order } from "./orders";
import { sendAdminGenerationFailed, sendAdminReportReady, sendReportReady } from "./email";

const SYSTEM_CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";

/**
 * Claude gets one shared time budget rather than a fixed cap per try: the
 * 27-page content is ~4-5k output tokens, which runs 70-120s depending on API
 * speed, so a 100s cap per attempt failed both tries on a slow day (17 Sep).
 * The first attempt may use the whole budget; a retry only starts if a failure
 * came back early enough to leave a real chance. 210s + PDF render, upload and
 * emails still fit the routes' 300s maxDuration.
 */
const GENERATION_ATTEMPTS = 2;
const RETRY_PAUSE_MS = 5_000;
const CLAUDE_BUDGET_MS = 210_000;
const MIN_ATTEMPT_MS = 60_000;

/** Flip to "true" in Vercel once reports no longer need a manual review before sending. */
const autoSendReports = () => process.env.AUTO_SEND_REPORTS === "true";

/**
 * executablePath() unpacks Chromium into /tmp. Two renders in one warm
 * instance unpacking at once fail with "spawn ETXTBSY", so share one unpack.
 */
let chromiumPath: Promise<string> | null = null;

/** On Vercel (no system Chrome available) we launch @sparticuz/chromium's bundled binary. */
async function launchBrowser() {
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const chromium = (await import("@sparticuz/chromium")).default;
    chromiumPath ??= chromium.executablePath().catch((e) => {
      chromiumPath = null;
      throw e;
    });
    return puppeteer.launch({
      executablePath: await chromiumPath,
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
    const pdf = await page.pdf({ width: "794px", height: "1123px", printBackground: true, preferCSSPageSize: true });
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
    preparedDate: new Date(),
    // Older rows (pre-migration-0005) have no report_lang → English.
    lang: order.report_lang ?? "en",
  };
}

/** One generation attempt: Claude content + the right template for the order's language. */
async function buildHtml(opts: ReportOptions, timeoutMs: number): Promise<{ html: string; costUsd: number }> {
  if (opts.lang && opts.lang !== "en") {
    const { content, costUsd } = await generateReportContent(opts);
    return { html: buildReportHtml(opts, content), costUsd };
  }
  // Our own attempts replace the SDK's retries, so one hung call can't eat the function's time budget.
  const client = new Anthropic({ timeout: timeoutMs, maxRetries: 0 });
  const { content, costUsd } = await generateReport27Content(opts, client);
  return { html: buildReport27Html(opts, content), costUsd };
}

async function withRetries<T>(orderId: string, attempt: (timeoutMs: number) => Promise<T>): Promise<T> {
  const deadline = Date.now() + CLAUDE_BUDGET_MS;
  let lastError: unknown;
  for (let i = 1; i <= GENERATION_ATTEMPTS; i++) {
    const remaining = deadline - Date.now();
    if (i > 1 && remaining < MIN_ATTEMPT_MS) break;
    try {
      return await attempt(remaining);
    } catch (e) {
      lastError = e;
      console.error(`order ${orderId}: generation attempt ${i}/${GENERATION_ATTEMPTS} failed after ${Math.round((CLAUDE_BUDGET_MS - (deadline - Date.now())) / 1000)}s`, e);
      if (i < GENERATION_ATTEMPTS) await new Promise((resolve) => setTimeout(resolve, RETRY_PAUSE_MS));
    }
  }
  throw lastError;
}

/**
 * Generate and store the report PDF for a paid order, then either send it
 * (AUTO_SEND_REPORTS) or hand it to the owner for review. Never throws —
 * errors land the order in 'failed' and alert the owner.
 */
export async function processPaidOrder(order: Order): Promise<void> {
  try {
    if (!(await claimOrderForGeneration(order.id))) {
      console.log(`order ${order.id}: already generating in another run, skipping`);
      return;
    }

    const opts = reportOptionsFor(order);
    const startedAt = Date.now();
    const { html, costUsd } = await withRetries(order.id, (timeoutMs) => buildHtml(opts, timeoutMs));
    console.log(`order ${order.id}: content ready in ${Math.round((Date.now() - startedAt) / 1000)}s`);
    const pdf = await renderPdf(html);

    // --- store the PDF in the private 'reports' bucket ---
    const filename = reportFileName(order.full_name);
    const pdfPath = `${order.id}/${filename}`;
    const { error: upErr } = await supabaseAdmin()
      .storage.from(REPORTS_BUCKET)
      .upload(pdfPath, pdf, { contentType: "application/pdf", upsert: true });
    if (upErr) throw upErr;

    // Queued as due now: sent straight away under AUTO_SEND_REPORTS, otherwise
    // it waits in the admin panel for the owner's "Send now".
    await updateOrder(order.id, {
      status: "scheduled",
      pdf_path: pdfPath,
      scheduled_at: new Date().toISOString(),
      claude_cost_usd: costUsd,
      error: null,
    });

    if (autoSendReports()) {
      await deliverScheduledOrder({ ...order, status: "scheduled", pdf_path: pdfPath });
      return;
    }

    console.log(`order ${order.id}: report ready, awaiting owner review`);
    await sendAdminReportReady({
      fullName: order.full_name,
      email: order.email,
      orderId: order.id,
      pdf,
      filename,
      costUsd,
    }).catch((e) => console.error(`order ${order.id}: review email failed`, e));
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error(`order ${order.id}: processing failed`, e);
    await updateOrder(order.id, { status: "failed", error: message }).catch(() => {});
    await sendAdminGenerationFailed({
      fullName: order.full_name,
      email: order.email,
      orderId: order.id,
      error: message,
    }).catch((err) => console.error(`order ${order.id}: failure alert email failed`, err));
  }
}

/**
 * Send the already-generated report PDF for a 'scheduled' or 'held' order.
 * Called straight after generation under AUTO_SEND_REPORTS, and by the admin
 * panel's "send now". Never throws — failures land the order in 'failed'.
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
      lang: order.report_lang ?? "en",
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
