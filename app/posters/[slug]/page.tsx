import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PRICE_LABEL } from "@/lib/pricing";
import { mulankBirthDays } from "@/lib/mulank-content";
import { POSTERS, POSTER_COPY, POSTER_SLUGS } from "@/lib/poster-content";
import { PosterCta } from "./PosterCta";
import styles from "./poster.module.css";

/**
 * Meta ad landing page. Deliberately bare: no header, footer or links — the
 * two CTAs are the only things a thumb can hit. Fully static, and the only
 * client JS is the CTA's click tracking.
 */
export function generateStaticParams() {
  return POSTER_SLUGS.map((slug) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const poster = POSTERS[slug];
  if (!poster) return {};

  return {
    title: `${POSTER_COPY.heading(poster.mulank)} — Mystic Digits`,
    description: `${POSTER_COPY.inside} · ${PRICE_LABEL}`,
    // Ad-only pages: keep them out of search so they don't compete with /mulank/[n].
    robots: { index: false, follow: false },
  };
}

export default async function PosterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const poster = POSTERS[slug];
  if (!poster) notFound();

  const n = poster.mulank;
  const days = mulankBirthDays(n);
  const daysText =
    days.length > 1 ? `${days.slice(0, -1).join(", ")} या ${days[days.length - 1]}` : String(days[0]);

  return (
    <main lang="hi" className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.brand}>Mystic Digits</div>
        <h1 className={styles.heading}>{POSTER_COPY.heading(n)}</h1>
        <p className={styles.for}>{daysText} तारीख को जन्मे लोगों के लिए</p>
        <p className={styles.inside}>{POSTER_COPY.inside}</p>
        <div className={styles.price}>{PRICE_LABEL}</div>
        <PosterCta slug={slug} position="top" label={POSTER_COPY.cta} className={`cta ${styles.cta}`} />
        <p className={styles.note}>
          {POSTER_COPY.priceNote}
          <br />
          {POSTER_COPY.langNote}
        </p>
      </section>

      <section className={styles.traits}>
        <h2 className={styles.traitsHeading}>{POSTER_COPY.traitsHeading(n)}</h2>
        <ul>
          {poster.traits.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </section>

      <section className={styles.bottom}>
        <div className={styles.price}>{PRICE_LABEL}</div>
        <PosterCta slug={slug} position="bottom" label={POSTER_COPY.cta} className={`cta ${styles.cta}`} />
        <p className={styles.note}>{POSTER_COPY.langNote}</p>
      </section>
    </main>
  );
}
