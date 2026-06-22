/**
 * One-off: wipe existing (dummy) orders, insert ONE real order, run it through
 * the real Claude content engine + PDF render + Supabase storage upload, and
 * leave it in 'scheduled' status so the admin panel's "Send now" can be used
 * to test the Resend delivery path for real.
 *
 *   npx tsx scripts/test-real-order.ts
 */
import puppeteer from "puppeteer";
import { existsSync } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { buildReportHtml, reportFileName, type ReportOptions } from "../src/lib/report-template";
import { generateReportContent } from "../src/lib/content-engine";

const ROOT = path.resolve(__dirname, "..");
const ENV_FILE = path.join(ROOT, ".env.local");
if (existsSync(ENV_FILE)) process.loadEnvFile(ENV_FILE);

const REPORTS_BUCKET = "reports";

const TEST_CUSTOMER = {
  fullName: "Beni MadhabG Gogoi",
  email: "beni.gogoi1@gmail.com",
  day: 28,
  month: 1,
  year: 1992,
};

function supabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function wipeOrders(sb: ReturnType<typeof supabase>) {
  console.log("Wiping existing orders + storage objects...");
  const { data: orders, error } = await sb.from("orders").select("id");
  if (error) throw error;

  for (const o of orders ?? []) {
    const { data: files } = await sb.storage.from(REPORTS_BUCKET).list(o.id);
    if (files && files.length) {
      await sb.storage.from(REPORTS_BUCKET).remove(files.map((f) => `${o.id}/${f.name}`));
    }
  }

  const { error: delErr } = await sb.from("orders").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (delErr) throw delErr;
  console.log(`Deleted ${orders?.length ?? 0} order(s).`);
}

async function renderPdf(html: string): Promise<Buffer> {
  const chromePath = process.env.CHROME_PATH;
  if (!chromePath || !existsSync(chromePath)) throw new Error(`Chrome not found at ${chromePath}`);
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--force-color-profile=srgb"],
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1 });
    await page.setContent(html, { waitUntil: "load" });
    await page.evaluateHandle("document.fonts.ready");
    await page.waitForNetworkIdle({ idleTime: 400 }).catch(() => {});
    await page.evaluate(() => {
      document.querySelectorAll<HTMLElement>(".body-copy").forEach((el) => {
        let fontSize = parseFloat(getComputedStyle(el).fontSize);
        let guard = 0;
        while (el.scrollHeight > el.clientHeight && fontSize > 13 && guard < 12) {
          fontSize -= 0.5;
          el.style.fontSize = fontSize + "px";
          guard++;
        }
      });
    });
    const pdf = await page.pdf({ width: "794px", height: "1123px", printBackground: true });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY not set");
  const sb = supabase();

  await wipeOrders(sb);

  console.log("Inserting real test order (status: paid)...");
  const { data: order, error: insErr } = await sb
    .from("orders")
    .insert({
      full_name: TEST_CUSTOMER.fullName,
      email: TEST_CUSTOMER.email,
      dob_day: TEST_CUSTOMER.day,
      dob_month: TEST_CUSTOMER.month,
      dob_year: TEST_CUSTOMER.year,
      tier: "numerology",
      amount_inr: 99,
      status: "paid",
    })
    .select()
    .single();
  if (insErr) throw insErr;
  console.log(`Order ${order.id} created.`);

  await sb.from("orders").update({ status: "generating" }).eq("id", order.id);

  const opts: ReportOptions = {
    fullName: order.full_name,
    day: order.dob_day,
    month: order.dob_month,
    year: order.dob_year,
    year1: new Date().getFullYear(),
    year2: new Date().getFullYear() + 1,
  };

  console.log("Generating content with Claude (real API call)...");
  const { content } = await generateReportContent(opts);
  const html = buildReportHtml(opts, content);

  console.log("Rendering PDF...");
  const pdf = await renderPdf(html);
  console.log(`PDF size: ${(pdf.length / 1024).toFixed(0)} KB`);

  const filename = reportFileName(order.full_name);
  const pdfPath = `${order.id}/${filename}`;
  console.log(`Uploading to storage bucket '${REPORTS_BUCKET}' at ${pdfPath}...`);
  const { error: upErr } = await sb.storage
    .from(REPORTS_BUCKET)
    .upload(pdfPath, pdf, { contentType: "application/pdf", upsert: true });
  if (upErr) throw upErr;

  await sb
    .from("orders")
    .update({ status: "scheduled", pdf_path: pdfPath, scheduled_at: new Date().toISOString(), error: null })
    .eq("id", order.id);

  console.log(`\nDone. Order ${order.id} is now 'scheduled' and immediately due.`);
  console.log("Go to /admin/orders and click 'Send now' to test the real Resend delivery.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
