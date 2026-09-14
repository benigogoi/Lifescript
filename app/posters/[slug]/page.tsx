import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PRICE_LABEL } from "@/lib/pricing";
import { mulankBirthDays } from "@/lib/mulank-content";
import { POSTERS, POSTER_COPY, POSTER_SLUGS } from "@/lib/poster-content";
import { PosterCta } from "./PosterCta";
import styles from "./poster.module.css";

/**
 * Meta ad landing page. Deliberately bare: logo but no menu, so the two CTAs
 * are the only prominent things to tap. The small policy footer stays because
 * a page with no way to check the seller reads as a scam. Fully static; the
 * only client JS is the CTA's click tracking.
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

/** 5 -> "5th", 21 -> "21st", 12 -> "12th". */
function ordinal(day: number): string {
  if (day % 100 >= 11 && day % 100 <= 13) return `${day}th`;
  return `${day}${({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[day % 10] ?? "th"}`;
}

export default async function PosterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const poster = POSTERS[slug];
  if (!poster) notFound();

  const n = poster.mulank;
  const days = mulankBirthDays(n).map(ordinal);
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
        <h1 className={styles.heading}>{POSTER_COPY.heading(n)}</h1>
        <p className={styles.for}>For anyone born on the {daysText} of any month</p>
        <p className={styles.inside}>{POSTER_COPY.inside}</p>
        <div className={styles.price}>{PRICE_LABEL}</div>
        <PosterCta slug={slug} position="top" label={POSTER_COPY.cta} className={`cta ${styles.cta}`} />
        <p className={styles.note}>
          {POSTER_COPY.payment}
          <br />
          {POSTER_COPY.priceNote}
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

      <section className={styles.sample}>
        <h2 className={styles.traitsHeading}>{POSTER_COPY.sampleHeading}</h2>
        <figure>
          <Image
            src="/samples/sample-loshu.webp"
            alt="Lo Shu grid page from a sample report"
            width={1191}
            height={1685}
            sizes="(max-width: 520px) 80vw, 400px"
            loading="lazy"
          />
          <figcaption>{POSTER_COPY.sampleCaption}</figcaption>
        </figure>
      </section>

      <section className={styles.bottom}>
        <div className={styles.price}>{PRICE_LABEL}</div>
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
