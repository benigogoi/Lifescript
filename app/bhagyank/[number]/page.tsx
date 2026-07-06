import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import {
  BHAGYANK_CONTENT,
  BHAGYANK_NUMBERS,
  type BhagyankNumber,
} from "@/lib/bhagyank-content";
import { pageMetadata, BASE_URL, SITE_NAME } from "@/lib/seo";

/** Pre-render /bhagyank/1 … /bhagyank/9 at build time. */
export function generateStaticParams() {
  return BHAGYANK_NUMBERS.map((n) => ({ number: String(n) }));
}

// Reject anything outside 1–9 (no on-demand pages for unknown numbers).
export const dynamicParams = false;

/** Narrow a raw route param to a valid Bhagyank number, or null. */
function toBhagyank(raw: string): BhagyankNumber | null {
  const n = Number(raw);
  return BHAGYANK_NUMBERS.includes(n as BhagyankNumber) ? (n as BhagyankNumber) : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ number: string }>;
}): Promise<Metadata> {
  const { number } = await params;
  const n = toBhagyank(number);
  if (!n) return {};

  const info = BHAGYANK_CONTENT[n];
  return pageMetadata({
    title: `Bhagyank ${n} Meaning, Life Path & Remedies — Mystic Digits`,
    description: `Bhagyank ${n} (destiny number ${n}) meaning, ruled by ${info.planet}. Discover the life path, opportunities, challenges, career direction, compatible numbers and Vedic remedy for Bhagyank ${n}.`,
    path: `/bhagyank/${n}`,
  });
}

export default async function BhagyankPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;
  const n = toBhagyank(number);
  if (!n) notFound();

  const info = BHAGYANK_CONTENT[n];

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: `Bhagyank ${n}: The ${info.planet} Life Path`,
      description: `Bhagyank ${n} meaning, life path, opportunities, challenges, careers and Vedic remedies.`,
      about: `Vedic Numerology Bhagyank ${n}`,
      datePublished: "2026-07-06",
      dateModified: "2026-07-06",
      author: { "@type": "Organization", name: SITE_NAME, url: BASE_URL },
      publisher: { "@type": "Organization", name: SITE_NAME, url: BASE_URL },
      mainEntityOfPage: `${BASE_URL}/bhagyank/${n}`,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: `Bhagyank ${n}`,
          item: `${BASE_URL}/bhagyank/${n}`,
        },
      ],
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />

      <main className="wrap">
        <div className="page-hero">
          <div className="eyebrow">Vedic Numerology · Destiny Number</div>
          <h1>
            Bhagyank {n}: The {info.planet} Life Path
          </h1>
          <p>{info.meaning}.</p>
        </div>

        <article className="legal-page">
          <h2>What Bhagyank {n} Means for Your Life Path</h2>
          <p>{info.destiny}</p>

          <h2>The Life Lesson of Destiny Number {n}</h2>
          <p>{info.lifeLesson}</p>

          <h2>Opportunities Written Into This Number</h2>
          <ul>
            {info.opportunities.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>

          <h2>Challenges Along the Way</h2>
          <ul>
            {info.challenges.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>

          <h2>Career &amp; Wealth Direction</h2>
          <ul>
            {info.careers.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>

          <h2>Compatible Numbers</h2>
          <p>
            Bhagyank {n} generally harmonises best with{" "}
            <strong>
              {info.compatible.join(", ").replace(/, ([^,]*)$/, " and $1")}
            </strong>
            . Partnerships — in marriage or business — with these numbers tend to flow with
            less friction and more mutual support.
          </p>

          <h2>Vedic Remedy for Bhagyank {n}</h2>
          <p>{info.remedy}</p>

          <p style={{ marginTop: 8 }}>
            Not sure of your numbers?{" "}
            <Link href="/calculator" style={{ color: "var(--gold)" }}>
              Use the free Mulank &amp; Bhagyank calculator
            </Link>{" "}
            to find yours in seconds. Your birth number tells the other half of the story —
            read about{" "}
            <Link href={`/mulank/${n}`} style={{ color: "var(--gold)" }}>
              Mulank {n}
            </Link>{" "}
            too.
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
          aria-label="Other Bhagyank numbers"
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 10,
            margin: "8px auto 56px",
          }}
        >
          {BHAGYANK_NUMBERS.map((b) => (
            <Link
              key={b}
              href={`/bhagyank/${b}`}
              aria-current={b === n ? "page" : undefined}
              className="card"
              style={{
                padding: "10px 16px",
                fontFamily: "var(--font-display)",
                fontSize: 18,
                color: b === n ? "var(--gold-bright)" : "var(--muted)",
                textDecoration: "none",
                borderColor: b === n ? "rgba(201, 168, 76, 0.5)" : undefined,
              }}
            >
              Bhagyank {b}
            </Link>
          ))}
        </nav>
      </main>

      <SiteFooter />
    </>
  );
}
