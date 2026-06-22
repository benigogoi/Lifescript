import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata = {
  title: "Refund Policy — Mystic Digits",
  description: "Mystic Digits's refund and cancellation policy for numerology report orders.",
};

export default function RefundPage() {
  return (
    <>
      <SiteHeader />
      <main className="wrap">
        <div className="page-hero">
          <div className="eyebrow">Legal</div>
          <h1>Refund Policy</h1>
        </div>
        <p className="legal-updated">Last updated: June 2026</p>

        <div className="legal-page">
          <h2>1. Why we have a no-refund policy</h2>
          <p>
            Each Mystic Digits report is generated specifically for you the moment you place your
            order — calculated from the exact name and date of birth you provide and delivered as a
            digital file. Because the product is created and delivered instantly and individually,
            we're unable to offer refunds once a report has been generated and sent.
          </p>

          <h2>2. Before you pay</h2>
          <p>
            You can preview your core numbers — Mulank, Bhagyank, Lo Shu grid, and Name Number — for
            free before paying anything. We recommend checking your free preview carefully and
            making sure your name and date of birth are entered correctly before proceeding to the
            ₹99 payment for your full report.
          </p>

          <h2>3. When we will make it right</h2>
          <p>We will issue a refund or re-deliver your report at no extra cost if:</p>
          <ul>
            <li>You were charged but never received your report due to a technical error on our end.</li>
            <li>Your report contains a calculation error caused by a problem with our system.</li>
            <li>You were charged more than once for the same order.</li>
          </ul>
          <p>
            If something like this happens, contact us within 7 days of your order with your order
            email, and we'll investigate and resolve it promptly.
          </p>

          <h2>4. Incorrect details entered by you</h2>
          <p>
            Since your report is calculated entirely from the name and date of birth you enter, we
            cannot offer a refund for a report generated using incorrect details you supplied at
            checkout. If you notice an error before your report has been generated, contact us
            immediately and we'll do our best to help.
          </p>

          <h2>5. How to request a resolution</h2>
          <p>
            Email{" "}
            <a href="mailto:support@mysticdigits.in" style={{ color: "var(--gold)" }}>
              support@mysticdigits.in
            </a>{" "}
            with your order email and a description of the issue. We aim to respond within 24–48
            hours.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
