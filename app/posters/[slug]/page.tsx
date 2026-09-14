import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PRICE_LABEL } from "@/lib/pricing";
import { mulankBirthDays } from "@/lib/mulank-content";
import { POSTERS, POSTER_COPY, POSTER_SLUGS, type Poster } from "@/lib/poster-content";
import { PosterCta } from "./PosterCta";
import { SampleZoom } from "./SampleZoom";
import styles from "./poster.module.css";

/**
 * Meta ad landing page. Deliberately bare: logo but no menu, so the two CTAs
 * are the only prominent things to tap. The small policy footer stays because
 * a page with no way to check the seller reads as a scam. Static, re-rendered
 * daily so month countdowns stay right; the only client JS is CTA tracking
 * and the optional sample zoom.
 */
export function generateStaticParams() {
  return POSTER_SLUGS.map((slug) => ({ slug }));
}

export const dynamicParams = false;
export const revalidate = 86400;

/** Whole months left in the year after the current one, in India: Sep → 3, Dec → 0. */
function monthsLeftInYear(): number {
  const month = Number(
    new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", month: "numeric" }).format(new Date()),
  );
  return 12 - month;
}

function headingFor(poster: Poster): string {
  return poster.heading ? poster.heading(monthsLeftInYear()) : POSTER_COPY.heading(poster.mulank);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const poster = POSTERS[slug];
  if (!poster) return {};

  return {
    title: `${headingFor(poster)} — Mystic Digits`,
    description: `${poster.subheading ?? POSTER_COPY.inside} · ${PRICE_LABEL}`,
    // Ad-only pages: keep them out of search so they don't compete with /mulank/[n].
    robots: { index: false, follow: false },
  };
}

/** 5 -> "5th", 21 -> "21st", 12 -> "12th". */
function ordinal(day: number): string {
  if (day % 100 >= 11 && day % 100 <= 13) return `${day}th`;
  return `${day}${({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[day % 10] ?? "th"}`;
}

export default async function PosterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const poster = POSTERS[slug];
  if (!poster) notFound();

  const monthsLeft = monthsLeftInYear();
  const days = mulankBirthDays(poster.mulank).map(ordinal);
  const daysText = days.length > 1 ? `${days.slice(0, -1).join(", ")} or ${days[days.length - 1]}` : days[0];

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <Image
          src="/logo.png"
          alt="Mystic Digits"
          width={76}
          height={76}
          sizes="76px"
          priority
          className={styles.logo}
        />
        <p className={styles.for}>Born on the {daysText}?</p>
        <h1 className={styles.heading}>{headingFor(poster)}</h1>
        <p className={styles.inside}>{poster.subheading ?? POSTER_COPY.inside}</p>
        <div className={styles.price}>{PRICE_LABEL}</div>
        <PosterCta slug={slug} position="top" label={POSTER_COPY.cta} className={`cta ${styles.cta}`} />
        <p className={styles.note}>
          {POSTER_COPY.payment}
          <br />
          {POSTER_COPY.priceNote}
        </p>
      </section>

      <section className={styles.traits}>
        <h2 className={styles.traitsHeading}>{poster.pointsHeading}</h2>
        <ul>
          {poster.points.map((p) => (
            <li key={p.text}>
              {p.lead && <strong>{p.lead} </strong>}
              {p.text}
            </li>
          ))}
        </ul>
      </section>

      {poster.showSample && (
        <section className={styles.sample}>
          <h2 className={styles.traitsHeading}>{POSTER_COPY.sampleHeading}</h2>
          <figure>
            <SampleZoom alt="Lo Shu grid page from a sample report" hint={POSTER_COPY.sampleHint} />
            <figcaption>{POSTER_COPY.sampleCaption}</figcaption>
          </figure>
        </section>
      )}

      <section className={styles.bottom}>
        {poster.closer && <p className={styles.closer}>{poster.closer(monthsLeft)}</p>}
        <div className={styles.price}>{PRICE_LABEL}</div>
        {poster.priceAnchor && <p className={styles.note}>{poster.priceAnchor}</p>}
        <PosterCta slug={slug} position="bottom" label={POSTER_COPY.cta} className={`cta ${styles.cta}`} />
        <p className={styles.note}>{POSTER_COPY.payment}</p>
      </section>

      <footer className={styles.footer}>
        <nav aria-label="Policies">
          <Link href="/contact">Contact</Link>
          <Link href="/refund">Refund Policy</Link>
          <Link href="/terms">Terms</Link>
        </nav>
        <p>&copy; {new Date().getFullYear()} Mystic Digits</p>
      </footer>
    </main>
  );
}
