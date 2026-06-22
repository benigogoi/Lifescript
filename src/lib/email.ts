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

export async function sendOrderConfirmation(opts: { to: string; firstName: string }) {
  const { to, firstName } = opts;
  return client().emails.send({
    from: FROM,
    to,
    subject: "We've received your order — your Mystic Digits report is being prepared",
    html: confirmationHtml(firstName),
  });
}

/** Deliver the finished report PDF as an attachment. */
export async function sendReportReady(opts: {
  to: string;
  firstName: string;
  pdf: Buffer;
  filename: string;
}) {
  const { to, firstName, pdf, filename } = opts;
  return client().emails.send({
    from: FROM,
    to,
    subject: `${firstName}, your Mystic Digits numerology report is ready`,
    html: reportReadyHtml(firstName),
    attachments: [{ filename, content: pdf }],
  });
}

function confirmationHtml(firstName: string): string {
  const safeName = firstName.replace(/[<>&]/g, "").trim() || "there";
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#05050a;font-family:Georgia,'Times New Roman',serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#05050a;padding:32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#0d0d12;border:1px solid rgba(201,168,76,0.18);border-radius:10px;">
            <tr>
              <td style="padding:36px 40px 8px;text-align:center;">
                <div style="font-family:'Marcellus',Georgia,serif;letter-spacing:6px;font-size:18px;color:#c9a84c;text-transform:uppercase;">
                  MYSTIC DIGITS
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 40px 0;text-align:center;">
                <h1 style="margin:0;font-size:28px;font-weight:500;color:#e8e8f0;line-height:1.2;">
                  Your reading is being prepared
                </h1>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 44px 0;text-align:center;">
                <p style="margin:0;font-size:16px;line-height:1.7;color:#9a9ab0;font-family:Helvetica,Arial,sans-serif;">
                  Dear ${safeName}, thank you — your payment has been received.
                  Your personalised 10-page numerology report is now being prepared
                  by hand from your name and date of birth, and will arrive in this
                  inbox <strong style="color:#e6c766;">within 24 hours</strong>.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 40px 0;text-align:center;">
                <div style="display:inline-block;padding:10px 22px;border:1px solid rgba(201,168,76,0.3);border-radius:4px;color:#c9a84c;font-family:Helvetica,Arial,sans-serif;font-size:13px;letter-spacing:1px;">
                  ORDER CONFIRMED &nbsp;·&nbsp; ₹99
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:30px 44px 40px;text-align:center;">
                <p style="margin:0;font-size:13px;line-height:1.7;color:#6f6f86;font-family:Helvetica,Arial,sans-serif;">
                  No action is needed from you. We'll email your report the moment it's ready.
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

function reportReadyHtml(firstName: string): string {
  const safeName = firstName.replace(/[<>&]/g, "").trim() || "there";
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#05050a;font-family:Georgia,'Times New Roman',serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#05050a;padding:32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#0d0d12;border:1px solid rgba(201,168,76,0.18);border-radius:10px;">
            <tr>
              <td style="padding:36px 40px 8px;text-align:center;">
                <div style="font-family:'Marcellus',Georgia,serif;letter-spacing:6px;font-size:18px;color:#c9a84c;text-transform:uppercase;">
                  MYSTIC DIGITS
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 40px 0;text-align:center;">
                <h1 style="margin:0;font-size:28px;font-weight:500;color:#e8e8f0;line-height:1.2;">
                  Your reading has arrived
                </h1>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 44px 0;text-align:center;">
                <p style="margin:0;font-size:16px;line-height:1.7;color:#9a9ab0;font-family:Helvetica,Arial,sans-serif;">
                  Dear ${safeName}, your personalised 10-page Mystic Digits numerology report is
                  ready and <strong style="color:#e6c766;">attached to this email</strong> as a PDF.
                  Read it somewhere quiet — it was written for you and no one else.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 40px 0;text-align:center;">
                <div style="display:inline-block;padding:10px 22px;border:1px solid rgba(201,168,76,0.3);border-radius:4px;color:#c9a84c;font-family:Helvetica,Arial,sans-serif;font-size:13px;letter-spacing:1px;">
                  YOUR REPORT &nbsp;·&nbsp; PDF ATTACHED
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:30px 44px 40px;text-align:center;">
                <p style="margin:0;font-size:13px;line-height:1.7;color:#6f6f86;font-family:Helvetica,Arial,sans-serif;">
                  With warmth, the Mystic Digits team. Reply to this email if you have any questions.
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
