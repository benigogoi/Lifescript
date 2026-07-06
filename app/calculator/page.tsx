import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { pageMetadata, BASE_URL } from "@/lib/seo";
import CalculatorForm from "./CalculatorForm";

export const metadata = pageMetadata({
  title: "Free Mulank & Bhagyank Calculator — Mystic Digits",
  description:
    "Instantly calculate your Mulank (birth number) and Bhagyank (destiny number) with our free Vedic numerology calculator — no signup needed. When you're ready, get your full personalised 10-page report.",
  path: "/calculator",
});

export default function CalculatorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Free Mulank & Bhagyank Calculator",
    url: `${BASE_URL}/calculator`,
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Web",
    description:
      "Free Vedic numerology calculator that finds your Mulank (birth number) and Bhagyank (destiny number) from your date of birth, with the ruling planet and lucky colour for each.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
    publisher: { "@type": "Organization", name: "Mystic Digits", url: BASE_URL },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader />

      <main className="wrap">
        <div className="page-hero">
          <div className="eyebrow">Free Vedic Numerology Tool</div>
          <h1>Mulank &amp; Bhagyank Calculator</h1>
          <p>
            Enter your name and date of birth to instantly find your Mulank (birth number) and
            Bhagyank (destiny number), with the ruling planet and lucky colour for each — free, no
            signup.
          </p>
        </div>

        <CalculatorForm />

        <section className="legal-page" style={{ paddingTop: 40 }}>
          <h2>What are Mulank and Bhagyank?</h2>
          <p>
            <strong>Mulank</strong>, or the birth number, comes from the day you were born. The
            digits of your birth day are added together and reduced to a single number from 1 to 9.
            For example, someone born on the 28th has a Mulank of 2 + 8 = 10 → 1. Your Mulank
            describes your core nature, instincts, and the way you meet the world.
          </p>
          <p>
            <strong>Bhagyank</strong>, or the destiny number, is drawn from your full date of birth.
            Every digit of your day, month, and year is added together and reduced to a single
            digit. Your Bhagyank points to the path your life tends to unfold along — the lessons,
            opportunities, and direction written into your numbers.
          </p>
          <p>
            This free calculator gives you a snapshot. Your complete{" "}
            <strong>10-page Vedic numerology report</strong> goes much further — your Lo Shu grid,
            Name Number, a personal reading for the year ahead, your lucky elements, and authentic
            Vedic remedies chosen for your ruling planet.
          </p>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
