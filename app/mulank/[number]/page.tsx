import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import {
  MULANK_CONTENT,
  MULANK_NUMBERS,
  mulankBirthDays,
  type MulankNumber,
} from "@/lib/mulank-content";
import { pageMetadata, BASE_URL, SITE_NAME } from "@/lib/seo";

/** Pre-render /mulank/1 … /mulank/9 at build time. */
export function generateStaticParams() {
  return MULANK_NUMBERS.map((n) => ({ number: String(n) }));
}

// Reject anything outside 1–9 (no on-demand pages for unknown numbers).
export const dynamicParams = false;

/** Narrow a raw route param to a valid Mulank number, or null. */
function toMulank(raw: string): MulankNumber | null {
  const n = Number(raw);
  return MULANK_NUMBERS.includes(n as MulankNumber) ? (n as MulankNumber) : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ number: string }>;
}): Promise<Metadata> {
  const { number } = await params;
  const n = toMulank(number);
  if (!n) return {};

  const info = MULANK_CONTENT[n];
  return pageMetadata({
    title: `Mulank ${n} Meaning, Personality & Remedies — Mystic Digits`,
    description: `Mulank ${n} meaning and moolank ${n} personality, ruled by ${info.planet}. Discover the strengths, weaknesses, career paths, lucky colour, and Vedic remedy for birth number ${n}.`,
    path: `/mulank/${n}`,
  });
}

export default async function MulankPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;
  const n = toMulank(number);
  if (!n) notFound();

  const info = MULANK_CONTENT[n];

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: `Mulank ${n}: The ${info.planet} Personality`,
      description: `Mulank ${n} meaning, personality, strengths, weaknesses, career paths and Vedic remedies.`,
      about: `Vedic Numerology Mulank ${n}`,
      datePublished: "2026-06-27",
      dateModified: "2026-07-06",
      author: { "@type": "Organization", name: SITE_NAME, url: BASE_URL },
      publisher: { "@type": "Organization", name: SITE_NAME, url: BASE_URL },
      mainEntityOfPage: `${BASE_URL}/mulank/${n}`,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: `Mulank ${n}`,
          item: `${BASE_URL}/mulank/${n}`,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: info.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  const birthDays = mulankBirthDays(n);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />

      <main className="wrap">
        <div className="page-hero">
          <div className="eyebrow">Vedic Numerology · Birth Number</div>
          <h1>
            Mulank {n}: The {info.planet} Personality
          </h1>
          <p>{info.meaning}.</p>
        </div>

        <article className="legal-page">
          <h2>Personality Traits</h2>
          <p>{info.personality}</p>

          <h2>Which Birth Dates Give Mulank {n}?</h2>
          <p>
            Anyone born on the{" "}
            <strong>
              {birthDays
                .map((d) => `${d}${d === 1 || d === 21 || d === 31 ? "st" : d === 2 || d === 22 ? "nd" : d === 3 || d === 23 ? "rd" : "th"}`)
                .join(", ")
                .replace(/, ([^,]*)$/, " or $1")}
            </strong>{" "}
            of any month has Mulank {n} — the digits of the birth day always reduce to {n}.
            The month and year don&apos;t matter for Mulank; they come into play for your
            Bhagyank (destiny number).
          </p>

          <h2>Strengths</h2>
          <ul>
            {info.strengths.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>

          <h2>Weaknesses</h2>
          <ul>
            {info.weaknesses.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>

          <h2>Love, Marriage &amp; Relationships</h2>
          <p>{info.love}</p>

          <h2>Career &amp; Money</h2>
          <ul>
            {info.careers.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <p>{info.careerDetail}</p>

          <h2>Health &amp; Wellbeing</h2>
          <p>{info.health}</p>

          <h2>Compatible Numbers</h2>
          <p>
            Mulank {n} generally harmonises best with{" "}
            <strong>
              {info.compatible.join(", ").replace(/, ([^,]*)$/, " and $1")}
            </strong>
            . Relationships and partnerships with these numbers tend to feel supportive and
            balanced.
          </p>

          <h2>Lucky Colour, Day &amp; Gemstone</h2>
          <ul>
            <li>
              <strong>Ruling planet:</strong> {info.planet}
            </li>
            <li>
              <strong>Lucky colour:</strong> {info.luckyColor}
            </li>
            <li>
              <strong>Lucky day:</strong> {info.luckyDay}
            </li>
            <li>
              <strong>Gemstone:</strong> {info.gemstone}
            </li>
          </ul>

          <h2>Mulank {n} in 2026</h2>
          <p>{info.year2026}</p>

          <h2>Vedic Remedy</h2>
          <p>{info.remedy}</p>

          <h2>Frequently Asked Questions</h2>
          {info.faqs.map((f) => (
            <div key={f.q}>
              <h3>{f.q}</h3>
              <p>{f.a}</p>
            </div>
          ))}

          <p style={{ marginTop: 8 }}>
            Not sure of your numbers?{" "}
            <Link href="/calculator" style={{ color: "var(--gold)" }}>
              Use the free Mulank &amp; Bhagyank calculator
            </Link>{" "}
            to find yours in seconds. And if your destiny number is also {n}, read what{" "}
            <Link href={`/bhagyank/${n}`} style={{ color: "var(--gold)" }}>
              Bhagyank {n}
            </Link>{" "}
            means for your life path.
          </p>
        </article>

        <section className="block" style={{ textAlign: "center", paddingTop: 8 }}>
          <div className="section-head">
            <h2>Your numbers, read in full</h2>
            <div className="divider" />
            <p className="sub">
              Discover your complete Vedic numerology report — Mulank, Bhagyank, Lo Shu grid, the
              year ahead, and your personal remedies.
            </p>
          </div>
          <Link href="/order" className="cta">
            Discover your complete Vedic numerology report — ₹99
          </Link>
        </section>

        <nav
          aria-label="Other Mulank numbers"
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 10,
            margin: "8px auto 56px",
          }}
        >
          {MULANK_NUMBERS.map((m) => (
            <Link
              key={m}
              href={`/mulank/${m}`}
              aria-current={m === n ? "page" : undefined}
              className="card"
              style={{
                padding: "10px 16px",
                fontFamily: "var(--font-display)",
                fontSize: 18,
                color: m === n ? "var(--gold-bright)" : "var(--muted)",
                textDecoration: "none",
                borderColor: m === n ? "rgba(201, 168, 76, 0.5)" : undefined,
              }}
            >
              Mulank {m}
            </Link>
          ))}
        </nav>
      </main>

      <SiteFooter />
    </>
  );
}
