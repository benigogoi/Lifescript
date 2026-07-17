/**
 * Mystic Digits — outbound email via Resend.
 *
 * Server-only. For now we send the instant order-confirmation. The report
 * delivery email (with the PDF) is added later alongside report generation.
 *
 * Sender: until the mysticdigits.in domain is verified in Resend, we use the
 * shared `onboarding@resend.dev` sender, which can only deliver to your own
 * Resend account email. Set EMAIL_FROM (and verify the domain) for production.
 */
import "server-only";
import { Resend } from "resend";
import type { ReportLang } from "./report-lang";

let cached: Resend | null = null;

function client(): Resend {
  if (cached) return cached;
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error("Resend is not configured. Set RESEND_API_KEY in .env.local.");
  }
  cached = new Resend(key);
  return cached;
}

const FROM = process.env.EMAIL_FROM ?? "Mystic Digits <onboarding@resend.dev>";

/** Per-language email copy. The layout/template is shared; only text swaps. */
const EMAIL_COPY = {
  en: {
    confirmSubject: "We've received your order — your Mystic Digits report is being prepared",
    confirmHeading: "Your reading is being prepared",
    confirmBody: (name: string) =>
      `Dear ${name}, thank you — your payment has been received.
                  Your personalised 10-page numerology report is now being prepared
                  by hand from your name and date of birth, and will arrive in this
                  inbox <strong style="color:#e6c766;">within 24 hours</strong>.`,
    confirmBadge: "ORDER CONFIRMED &nbsp;·&nbsp; ₹99",
    confirmFooter: "No action is needed from you. We'll email your report the moment it's ready.",
    readySubject: (name: string) => `${name}, your Mystic Digits numerology report is ready`,
    readyHeading: "Your reading has arrived",
    readyBody: (name: string) =>
      `Dear ${name}, your personalised 10-page Mystic Digits numerology report is
                  ready and <strong style="color:#e6c766;">attached to this email</strong> as a PDF.
                  Read it somewhere quiet — it was written for you and no one else.`,
    readyBadge: "YOUR REPORT &nbsp;·&nbsp; PDF ATTACHED",
    readyFooter: "With warmth, the Mystic Digits team. Reply to this email if you have any questions.",
  },
  as: {
    confirmSubject: "আপোনাৰ অৰ্ডাৰ পাইছোঁ — আপোনাৰ Mystic Digits ৰিপ'ৰ্ট প্ৰস্তুত হৈ আছে",
    confirmHeading: "আপোনাৰ ৰিপ'ৰ্ট প্ৰস্তুত কৰা হৈ আছে",
    confirmBody: (name: string) =>
      `মৰমৰ ${name}, ধন্যবাদ — আপোনাৰ পেমেণ্ট পোৱা গৈছে।
                  আপোনাৰ নাম আৰু জন্ম তাৰিখৰ পৰা আপোনাৰ ব্যক্তিগত ১০-পৃষ্ঠাৰ
                  সংখ্যাতত্ত্ব ৰিপ'ৰ্টখন যত্নেৰে প্ৰস্তুত কৰা হৈ আছে, আৰু
                  <strong style="color:#e6c766;">২৪ ঘণ্টাৰ ভিতৰত</strong> এই ইনবক্সতে আহি পাব।`,
    confirmBadge: "অৰ্ডাৰ নিশ্চিত &nbsp;·&nbsp; ₹৯৯",
    confirmFooter: "আপুনি একো কৰিবলগীয়া নাই। ৰিপ'ৰ্ট সাজু হোৱাৰ লগে লগে আমি ইমেইল কৰিম।",
    readySubject: (name: string) => `${name}, আপোনাৰ Mystic Digits সংখ্যাতত্ত্ব ৰিপ'ৰ্ট সাজু হৈছে`,
    readyHeading: "আপোনাৰ ৰিপ'ৰ্ট আহি পালে",
    readyBody: (name: string) =>
      `মৰমৰ ${name}, আপোনাৰ ব্যক্তিগত ১০-পৃষ্ঠাৰ Mystic Digits সংখ্যাতত্ত্ব
                  ৰিপ'ৰ্টখন সাজু — <strong style="color:#e6c766;">এই ইমেইলৰ লগত PDF হিচাপে
                  সংলগ্ন</strong> কৰা আছে। কোনো নিৰিবিলি ঠাইত বহি পঢ়িব — এইখন লিখা হৈছে
                  কেৱল আপোনাৰ বাবে।`,
    readyBadge: "আপোনাৰ ৰিপ'ৰ্ট &nbsp;·&nbsp; PDF সংলগ্ন",
    readyFooter: "আন্তৰিকতাৰে, Mystic Digits। কিবা প্ৰশ্ন থাকিলে এই ইমেইলতে উত্তৰ দিব।",
  },
} satisfies Record<ReportLang, unknown>;

export async function sendOrderConfirmation(opts: { to: string; firstName: string; lang?: ReportLang }) {
  const { to, firstName, lang = "en" } = opts;
  const copy = EMAIL_COPY[lang] ?? EMAIL_COPY.en;
  const { error } = await client().emails.send({
    from: FROM,
    to,
    subject: copy.confirmSubject,
    html: confirmationHtml(firstName, lang),
  });
  // The Resend SDK resolves with { error } on API-level failures (e.g. an
  // unverified sender domain) instead of throwing — surface it so callers'
  // error handling (order status, retries) actually engages.
  if (error) throw new Error(`Resend: ${error.message}`);
}

/** Deliver the finished report PDF as an attachment. */
export async function sendReportReady(opts: {
  to: string;
  firstName: string;
  pdf: Buffer;
  filename: string;
  lang?: ReportLang;
}) {
  const { to, firstName, pdf, filename, lang = "en" } = opts;
  const copy = EMAIL_COPY[lang] ?? EMAIL_COPY.en;
  const { error } = await client().emails.send({
    from: FROM,
    to,
    subject: copy.readySubject(firstName),
    html: reportReadyHtml(firstName, lang),
    attachments: [{ filename, content: pdf }],
  });
  if (error) throw new Error(`Resend: ${error.message}`);
}

/** Shared dark/gold email shell: heading, body paragraph, badge, footer. */
function emailShell(heading: string, body: string, badge: string, footer: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#05050a;font-family:Georgia,'Times New Roman',serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#05050a;padding:32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#0d0d12;border:1px solid rgba(201,168,76,0.18);border-radius:10px;">
            <tr>
              <td style="padding:36px 40px 8px;text-align:center;">
                <!-- Absolute URL: email clients can't resolve relative paths,
                     and most strip data: URIs — must point at the live site. -->
                <img src="https://mysticdigits.in/logo.png" alt="MYSTIC DIGITS" width="110" style="display:block;margin:0 auto;max-width:110px;height:auto;" />
              </td>
            </tr>
            <tr>
              <td style="padding:24px 40px 0;text-align:center;">
                <h1 style="margin:0;font-size:28px;font-weight:500;color:#e8e8f0;line-height:1.2;">
                  ${heading}
                </h1>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 44px 0;text-align:center;">
                <p style="margin:0;font-size:16px;line-height:1.7;color:#9a9ab0;font-family:Helvetica,Arial,sans-serif;">
                  ${body}
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 40px 0;text-align:center;">
                <div style="display:inline-block;padding:10px 22px;border:1px solid rgba(201,168,76,0.3);border-radius:4px;color:#c9a84c;font-family:Helvetica,Arial,sans-serif;font-size:13px;letter-spacing:1px;">
                  ${badge}
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:30px 44px 40px;text-align:center;">
                <p style="margin:0;font-size:13px;line-height:1.7;color:#6f6f86;font-family:Helvetica,Arial,sans-serif;">
                  ${footer}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function confirmationHtml(firstName: string, lang: ReportLang): string {
  const copy = EMAIL_COPY[lang] ?? EMAIL_COPY.en;
  const safeName = firstName.replace(/[<>&]/g, "").trim() || "there";
  return emailShell(copy.confirmHeading, copy.confirmBody(safeName), copy.confirmBadge, copy.confirmFooter);
}

function reportReadyHtml(firstName: string, lang: ReportLang): string {
  const copy = EMAIL_COPY[lang] ?? EMAIL_COPY.en;
  const safeName = firstName.replace(/[<>&]/g, "").trim() || "there";
  return emailShell(copy.readyHeading, copy.readyBody(safeName), copy.readyBadge, copy.readyFooter);
}
