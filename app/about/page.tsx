import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata = {
  title: "About Us — LifeScript",
  description:
    "LifeScript prepares personalised Indian Vedic numerology reports from your name and date of birth — clear, warm, and rooted in tradition.",
};

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="wrap">
        <div className="page-hero">
          <div className="eyebrow">About LifeScript</div>
          <h1>Numbers, read with care.</h1>
          <p>
            LifeScript exists to make Indian Vedic numerology accessible, accurate, and genuinely
            personal — without the guesswork or generic horoscope filler.
          </p>
        </div>

        <div className="legal-page">
          <h2>What we do</h2>
          <p>
            Every LifeScript report is calculated from your own full name and date of birth using
            classical numerology methods — Mulank (birth number), Bhagyank (destiny number), the
            Chaldean name number, and the Lo Shu grid. We pair that calculation with a written
            reading covering your personality, the year ahead, lucky elements, and Vedic remedies
            tied to your ruling planet.
          </p>
          <p>
            We believe numerology should be empowering, not fatalistic. Our reports are written to
            help you understand your natural strengths and where to grow — never to predict
            misfortune.
          </p>

          <h2>Why ₹99</h2>
          <p>
            We kept the price of a full report low and transparent on purpose: a detailed, well
            written reading shouldn't be locked behind a premium price tag. You can preview your
            core numbers for free before deciding to order the complete 10-page report.
          </p>

          <h2>Our approach</h2>
          <ul>
            <li>Calculations follow standard Vedic/Chaldean numerology conventions.</li>
            <li>Every report is generated specifically for the name and date of birth you provide.</li>
            <li>We never sell or share your personal details with third parties.</li>
          </ul>

          <h2>Questions?</h2>
          <p>
            Reach us anytime at{" "}
            <a href="mailto:support@lifescript.co.in" style={{ color: "var(--gold)" }}>
              support@lifescript.co.in
            </a>{" "}
            — or visit our <a href="/faq" style={{ color: "var(--gold)" }}>FAQ</a> page for quick
            answers.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
