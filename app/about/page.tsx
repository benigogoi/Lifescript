import { SiteHeader } from "@/components/SiteHeader";
import { PRICE_LABEL } from "@/lib/pricing";
import { SiteFooter } from "@/components/SiteFooter";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "About Us — Mystic Digits",
  description:
    "Mystic Digits prepares personalised Indian Vedic numerology reports from your name and date of birth — clear, warm, and rooted in tradition.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="wrap">
        <div className="page-hero">
          <div className="eyebrow">About Mystic Digits</div>
          <h1>Numbers, read with care.</h1>
          <p>
            Mystic Digits exists to make Indian Vedic numerology accessible, accurate, and genuinely
            personal — without the guesswork or generic horoscope filler.
          </p>
        </div>

        <div className="legal-page">
          <h2>What we do</h2>
          <p>
            Every Mystic Digits report is calculated from your own full name and date of birth using
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

          <h2>What you pay for</h2>
          <p>
            Your core numbers are free, and always will be — you can see your Mulank, Bhagyank
            and Name Number without paying anything, or even giving us an email. What the{" "}
            {PRICE_LABEL} buys is the complete report: 27 designed pages written for your chart
            alone, as a PDF you can keep, revisit, share or give to someone.
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
            <a href="mailto:support@mysticdigits.in" style={{ color: "var(--gold)" }}>
              support@mysticdigits.in
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
