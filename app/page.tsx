import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Mandala } from "@/components/Mandala";
import { SECTION_ICONS, ShieldCheckIcon, ClockIcon, SparkleIcon } from "@/components/icons";
import { BASE_URL, pageMetadata, productSchema, schemaGraph } from "@/lib/seo";
import { PRICE_INR } from "@/lib/order";

// Keyword-first: with little brand authority yet, the leading characters of
// the title are better spent on what people actually search for.
export const metadata = pageMetadata({
  title: "Personalised Indian Numerology Report — Mystic Digits",
  description:
    "Get a 10-page Vedic numerology report written from your name and date of birth — Mulank, Bhagyank, Lo Shu grid, the year ahead and your remedies. ₹99, delivered within 24 hours.",
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

const SAMPLE_PAGES = [
  {
    src: "/samples/sample-cover.webp",
    alt: "Sample report cover page — dark and gold Vedic numerology design",
    caption: "Your cover, with your name in gold",
  },
  {
    src: "/samples/sample-loshu.webp",
    alt: "Sample Lo Shu grid page showing present and missing numbers with strong planes and arrows",
    caption: "Your Lo Shu grid, planes & arrows",
  },
  {
    src: "/samples/sample-lucky.webp",
    alt: "Sample lucky elements page with colours, days, gemstone, metal and direction",
    caption: "Your lucky colours, days & gemstone",
  },
];

const STEPS = [
  { n: "1", t: "Share your details", d: "Just your full name and date of birth — nothing more." },
  { n: "2", t: "We prepare your report", d: "Your unique numbers are read and your 10-page report is written for you." },
  { n: "3", t: "Delivered to your inbox", d: "A beautiful PDF arrives within 24 hours, ready to keep forever." },
];

/**
 * Homepage FAQ — deliberately answers the calculation questions people search
 * for ("how is mulank calculated", "difference between mulank and bhagyank")
 * rather than repeating the support answers already on /faq.
 */
const HOME_FAQS = [
  {
    q: "How is your numerology report calculated?",
    a: "Everything is derived from two inputs: your full name and your date of birth. Your Mulank comes from the day you were born, reduced to a single digit. Your Bhagyank comes from your complete date of birth — day, month and year — added together and reduced. Your name number comes from the Vedic (Chaldean) letter values of your full name. Your Lo Shu grid is built by placing every digit of your birth date into a 3×3 grid, which reveals both the numbers you carry and the ones missing from your chart.",
  },
  {
    q: "What is the difference between Mulank and Bhagyank?",
    a: "Mulank is your birth number — it describes your personality, instincts and how you meet the world day to day. Bhagyank is your destiny number, drawn from your whole date of birth, and it describes the direction your life keeps pulling towards regardless of temperament. Mulank is who you are; Bhagyank is where you are going. A full reading needs both, which is why the report interprets them together rather than separately.",
  },
  {
    q: "How much does the numerology report cost and when will I get it?",
    a: `The complete 10-page report is ₹${PRICE_INR}, paid securely through Razorpay — there is no subscription and nothing recurring. Your report is prepared and emailed to you as a PDF within 24 hours of ordering. You can also see your Mulank, Bhagyank and name number for free in the instant preview before you pay anything.`,
  },
  {
    q: "Is this Indian Vedic numerology or Western numerology?",
    a: "This is Indian Vedic numerology. The calculations follow the Chaldean-Vedic system used across India — Mulank, Bhagyank, the Lo Shu grid, ruling planets, and remedies tied to those planets. It is not the Pythagorean system common in Western numerology, which assigns different values to letters and produces different numbers from the same name.",
  },
  {
    q: "Do I need to know my birth time?",
    a: "No. Numerology works from your date of birth and your name only — unlike astrology, it does not need a birth time or place. That makes it useful for anyone who has never known their exact time of birth.",
  },
];

export default function Home() {
  const jsonLd = schemaGraph(productSchema(), {
    "@type": "FAQPage",
    "@id": `${BASE_URL}/#faq`,
    mainEntity: HOME_FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />

      <main className="wrap">
        <section className="hero">
          <Mandala className="hero-mandala" />
          <div className="eyebrow">Indian · Vedic Numerology</div>
          <h1>
            Your life, written in <em>numbers</em>.
            <span className="hero-subtitle">Personalised Indian Numerology Report</span>
          </h1>
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

        <section className="block" id="sample">
          <div className="section-head">
            <h2>See it for yourself</h2>
            <div className="divider" />
            <p className="sub">
              Real pages from Ananya&apos;s sample report. Yours is prepared from your numbers
              alone — no two reports are the same.
            </p>
          </div>
          <div className="samples">
            {SAMPLE_PAGES.map((s) => (
              <figure className="sample-page" key={s.src}>
                {/* Without `sizes`, Next assumes 100vw and browsers pull the
                    3840px candidate for a column that is never wider than ~360px. */}
                <Image
                  src={s.src}
                  alt={s.alt}
                  width={1191}
                  height={1685}
                  loading="lazy"
                  sizes="(max-width: 620px) 95vw, 300px"
                />
                <figcaption>{s.caption}</figcaption>
              </figure>
            ))}
          </div>
          <div className="samples-cta">
            <Link href="/order" className="cta cta-ghost cta-sm">
              Get yours, written for your numbers →
            </Link>
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

        <section className="block" id="faq">
          <div className="section-head">
            <h2>Common questions about Indian numerology</h2>
            <div className="divider" />
            <p className="sub">
              How the numbers are worked out, and what your report actually contains.
            </p>
          </div>
          <div className="faq-list">
            {HOME_FAQS.map((f) => (
              <details className="faq-item" key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
          <p style={{ textAlign: "center", marginTop: 22, color: "var(--muted)", fontSize: 14 }}>
            More answers on the <Link href="/faq" style={{ color: "var(--gold)" }}>full FAQ page</Link>, or{" "}
            <Link href="/calculator" style={{ color: "var(--gold)" }}>find your numbers free</Link> first.
          </p>
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
