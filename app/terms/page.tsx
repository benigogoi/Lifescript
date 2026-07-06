import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Terms & Conditions — Mystic Digits",
  description: "The terms and conditions governing your use of Mystic Digits and your numerology report order.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main className="wrap">
        <div className="page-hero">
          <div className="eyebrow">Legal</div>
          <h1>Terms &amp; Conditions</h1>
        </div>
        <p className="legal-updated">Last updated: June 2026</p>

        <div className="legal-page">
          <h2>1. About these terms</h2>
          <p>
            These terms govern your use of the Mystic Digits website and your purchase of a Mystic Digits
            numerology report. By placing an order, you agree to these terms.
          </p>

          <h2>2. The service</h2>
          <p>
            Mystic Digits prepares a personalised numerology report based on the full name and date of
            birth you provide. We offer a free preview of your core numbers, and a complete 10-page
            report for a one-time fee of ₹99. Reports are generated using classical Vedic and
            Chaldean numerology methods and are intended for entertainment, self-reflection, and
            guidance purposes only.
          </p>

          <h2>3. Accuracy of information you provide</h2>
          <p>
            Your report is calculated entirely from the name and date of birth you enter. You're
            responsible for entering this information correctly — we are not able to verify it, and
            an incorrect name or date of birth will produce an incorrect report.
          </p>

          <h2>4. Not professional advice</h2>
          <p>
            Numerology readings are offered for guidance and entertainment. They are not a
            substitute for professional medical, legal, financial, or psychological advice. Please
            use your own judgement before making important life decisions based on your report.
          </p>

          <h2>5. Payment</h2>
          <p>
            Payment for the full report is processed securely through our third-party payment
            gateway. The report fee is ₹99 unless otherwise stated on the order page at checkout.
          </p>

          <h2>6. Delivery</h2>
          <p>
            Your full report is delivered as a PDF to the email address you provide, typically
            within 24 hours of successful payment.
          </p>

          <h2>7. Refunds</h2>
          <p>
            Refunds are handled according to our{" "}
            <a href="/refund" style={{ color: "var(--gold)" }}>Refund Policy</a>.
          </p>

          <h2>8. Intellectual property</h2>
          <p>
            The Mystic Digits name, branding, website design, and report templates are our property.
            Your individual report is yours to keep and use personally once delivered.
          </p>

          <h2>9. Limitation of liability</h2>
          <p>
            Mystic Digits and its team are not liable for any decisions made or outcomes resulting from
            the use of your report. The service is provided "as is" without warranties of any kind.
          </p>

          <h2>10. Changes to these terms</h2>
          <p>
            We may update these terms from time to time. Continued use of the site after changes
            means you accept the updated terms.
          </p>

          <h2>11. Contact us</h2>
          <p>
            For any questions about these terms, email{" "}
            <a href="mailto:support@mysticdigits.in" style={{ color: "var(--gold)" }}>
              support@mysticdigits.in
            </a>
            .
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
