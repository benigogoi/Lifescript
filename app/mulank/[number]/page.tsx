import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import {
  MULANK_CONTENT,
  MULANK_NUMBERS,
  type MulankNumber,
} from "@/lib/mulank-content";

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
  return {
    title: `Mulank ${n} — Meaning, Personality & Vedic Remedies`,
    description: `Mulank ${n} meaning and moolank ${n} personality, ruled by ${info.planet}. Discover the strengths, weaknesses, career paths, lucky colour, and Vedic remedy for birth number ${n}.`,
    alternates: { canonical: `/mulank/${n}` },
  };
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `Mulank ${n}: The ${info.planet} Personality`,
    description: `Mulank ${n} meaning, personality, strengths, weaknesses, career paths and Vedic remedies.`,
    about: `Vedic Numerology Mulank ${n}`,
  };

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

          <h2>Career Paths</h2>
          <ul>
            {info.careers.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>

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

          <h2>Vedic Remedy</h2>
          <p>{info.remedy}</p>

          <p style={{ marginTop: 8 }}>
            Not sure of your numbers?{" "}
            <Link href="/calculator" style={{ color: "var(--gold)" }}>
              Use the free Mulank &amp; Bhagyank calculator
            </Link>{" "}
            to find yours in seconds.
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
