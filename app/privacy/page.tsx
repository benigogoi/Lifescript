import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata = {
  title: "Privacy Policy — LifeScript",
  description: "How LifeScript collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="wrap">
        <div className="page-hero">
          <div className="eyebrow">Legal</div>
          <h1>Privacy Policy</h1>
        </div>
        <p className="legal-updated">Last updated: June 2026</p>

        <div className="legal-page">
          <h2>1. Information we collect</h2>
          <p>When you use LifeScript, we collect:</p>
          <ul>
            <li><strong>Your full name and date of birth</strong> — used to calculate your numerology report.</li>
            <li><strong>Your email address</strong> — used to deliver your report and send order updates.</li>
            <li><strong>Payment information</strong> — processed entirely by our third-party payment gateway. We do not store your card, UPI, or banking details ourselves.</li>
            <li><strong>Basic technical data</strong> (such as browser type and IP address) collected automatically for security and analytics purposes.</li>
          </ul>

          <h2>2. How we use your information</h2>
          <p>We use the information you provide to:</p>
          <ul>
            <li>Calculate and generate your personalised numerology report.</li>
            <li>Deliver your report and communicate about your order.</li>
            <li>Process payment securely through our payment partner.</li>
            <li>Improve our service and prevent fraud or misuse.</li>
          </ul>
          <p>We do not use your name or date of birth for any purpose beyond preparing and delivering your report.</p>

          <h2>3. Sharing your information</h2>
          <p>
            We do not sell or rent your personal information. We share data only with the service
            providers necessary to operate LifeScript — such as our payment gateway, email
            delivery provider, and cloud hosting/database provider — each bound to protect your
            data and use it only to provide their service to us.
          </p>

          <h2>4. Data retention</h2>
          <p>
            We retain your order details and report for as long as needed to provide support and
            meet our legal and accounting obligations. You may request deletion of your personal
            data at any time by contacting us, subject to records we're required to keep by law.
          </p>

          <h2>5. Your rights</h2>
          <p>
            You may request access to, correction of, or deletion of your personal data at any
            time by emailing us. We will respond within a reasonable time.
          </p>

          <h2>6. Cookies</h2>
          <p>
            We use minimal, essential cookies to keep the site functioning correctly. We do not
            use third-party advertising cookies.
          </p>

          <h2>7. Contact us</h2>
          <p>
            For any privacy-related questions, email{" "}
            <a href="mailto:support@lifescript.co.in" style={{ color: "var(--gold)" }}>
              support@lifescript.co.in
            </a>
            .
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
