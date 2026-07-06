import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Mandala } from "@/components/Mandala";
import { SECTION_ICONS, ShieldCheckIcon, ClockIcon, SparkleIcon } from "@/components/icons";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Mystic Digits — Your Personalised Indian Numerology Report",
  description:
    "A beautiful 10-page Vedic numerology report written uniquely for your name and date of birth. Delivered to your inbox.",
  path: "/",
});

const ACCENTS = ["gold", "red", "violet"] as const;

const SECTIONS = [
  { n: "01", t: "Mulank", d: "Your birth-day number — the core of your personality and instincts." },
  { n: "02", t: "Bhagyank", d: "Your destiny number, drawn from your full date of birth." },
  { n: "03", t: "Lo Shu Grid", d: "Your 3×3 energy grid — the numbers you carry and those you lack." },
  { n: "04", t: "Name Number", d: "What the vibration of your name gives you, and how to use it." },
  { n: "05", t: "Year Ahead", d: "A personal reading for the year you're in right now." },
  { n: "06", t: "The Year After", d: "What the next year holds, and how to prepare for it." },
  { n: "07", t: "Lucky Elements", d: "Your colours, days, gemstone, metal and direction." },
  { n: "08", t: "Vedic Remedies", d: "Simple, authentic remedies aligned to your ruling planet." },
  { n: "09", t: "Your Mantra", d: "A mantra chosen to strengthen your numbers." },
  { n: "10", t: "A Closing Blessing", d: "A warm, personal note to carry your reading forward." },
];

const STEPS = [
  { n: "1", t: "Share your details", d: "Just your full name and date of birth — nothing more." },
  { n: "2", t: "We prepare your report", d: "Your unique numbers are read and your 10-page report is written for you." },
  { n: "3", t: "Delivered to your inbox", d: "A beautiful PDF arrives within 24 hours, ready to keep forever." },
];

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main className="wrap">
        <section className="hero">
          <Mandala className="hero-mandala" />
          <div className="eyebrow">Indian · Vedic Numerology</div>
          <h1>
            Your life, written in <em>numbers</em>.
          </h1>
          <h2 className="hero-subtitle">Personalised Vedic Numerology Report</h2>
          <p className="lede">
            A beautiful 10-page numerology report, prepared uniquely from your name and date of
            birth — your Mulank, Bhagyank, Lo Shu grid, the year ahead, and your personal Vedic
            remedies. Delivered to your inbox.
          </p>
          <Link href="/order" className="cta">
            Get My Report
          </Link>
          <div className="price-note">
            Just <strong>₹99</strong> · delivered within 24 hours
          </div>
          <p className="hero-calc-note">
            Curious what your numbers say before you order? Find your Mulank — your birth number —
            and your Bhagyank, the destiny number, in seconds with our free calculator. When
            you&apos;re ready, your full numerology report reads them together, deeply and
            personally.
          </p>
          <div>
            <Link href="/calculator" className="cta cta-ghost cta-sm">
              Try the Free Mulank Calculator →
            </Link>
          </div>

          <div className="trust-row">
            <div className="trust-badge">
              <ShieldCheckIcon />
              Calculated from real Vedic numerology
            </div>
            <div className="trust-badge">
              <SparkleIcon />
              Free instant preview, no signup
            </div>
            <div className="trust-badge">
              <ClockIcon />
              Delivered within 24 hours
            </div>
          </div>
        </section>

        <section className="block" id="inside">
          <div className="section-head">
            <h2>What's inside your report</h2>
            <div className="divider" />
            <p className="sub">Ten pages, written for you and no one else.</p>
          </div>
          <div className="grid">
            {SECTIONS.map((s, i) => {
              const Icon = SECTION_ICONS[i];
              const accent = ACCENTS[i % ACCENTS.length];
              return (
                <div className="card" data-accent={accent} key={s.n}>
                  <div className="card-top">
                    <Icon className="icon" />
                    <div className="num">{s.n}</div>
                  </div>
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="block" id="how">
          <div className="section-head">
            <h2>How it works</h2>
            <div className="divider" />
          </div>
          <div className="steps">
            {STEPS.map((s) => (
              <div className="step" key={s.n}>
                <div className="circle">{s.n}</div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="block" style={{ textAlign: "center" }}>
          <div className="section-head">
            <h2>Ready to read yours?</h2>
            <div className="divider" />
            <p className="sub">It takes less than a minute to begin.</p>
          </div>
          <Link href="/order" className="cta">
            Get My Report · ₹99
          </Link>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
