import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import CalculatorForm from "./CalculatorForm";

export const metadata = {
  title: "Free Mulank & Bhagyank Calculator | Vedic Numerology",
  description:
    "Calculate your Mulank (birth number) and Bhagyank (destiny number) free. Based on Vedic numerology. Get your full 10-page report for ₹99.",
  alternates: { canonical: "/calculator" },
};

export default function CalculatorPage() {
  return (
    <>
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
