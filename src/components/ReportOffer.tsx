"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { PRICE_LABEL } from "@/lib/pricing";
import { trackOfferViewed } from "@/lib/analytics";
import { LUCKY } from "@/lib/lucky";
import type { Digit, LoShuGrid } from "@/lib/numerology";
import { LO_SHU_LAYOUT } from "@/lib/numerology";

/**
 * The paid product, shown immediately under a visitor's free result.
 *
 * The numbers themselves are free everywhere on the internet, so a list of what
 * the report "contains" sells nothing — it describes a category the reader can
 * get from any free calculator. What we have that nobody else does is *their*
 * chart, already computed. So this block shows real findings about them and
 * stops short of the interpretation, which is what the report is for.
 *
 * Everything here is arithmetic and static lookup tables in the browser: no API
 * call, no Claude, no per-visitor cost. LUCKY is imported from ./lucky rather
 * than ./report-data so the client doesn't pull in ~55KB of report prose.
 *
 * No testimonials, no counts, no countdowns: nothing is claimed that isn't
 * verifiably true of the product.
 */

const SAMPLE_PAGES = [
  { src: "/samples/sample-cover.webp", alt: "Report cover page with the reader's name set in gold", caption: "Your cover, with your name in gold" },
  { src: "/samples/sample-loshu.webp", alt: "Lo Shu grid page showing planes and arrows", caption: "Your Lo Shu grid, planes & arrows" },
  { src: "/samples/sample-lucky.webp", alt: "Lucky elements page showing colours, days and gemstone", caption: "Your lucky colours, days & gemstone" },
];

export interface OfferChart {
  mulank: Digit;
  loShu: LoShuGrid;
}

/** "3, 5 and 7" — reads like a sentence rather than a CSV. */
function listOut(items: (string | number)[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return String(items[0]);
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

export function ReportOffer({
  where,
  chart,
  children,
}: {
  /** Which page this is rendered on — kept on the analytics events. */
  where: "calculator" | "order";
  /** The visitor's own chart, so the offer can be about them and not the product. */
  chart?: OfferChart;
  /** The call-to-action: a link on the calculator, a buy button on /order. */
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Fire "offer viewed" only when the card is genuinely on screen AND the tab
  // is actually being looked at. Rendering below the fold isn't seeing it, and
  // neither is having the page open in a background tab.
  //
  // A plain scroll listener rather than IntersectionObserver: IO callbacks are
  // suppressed entirely while a document is hidden, which makes the behaviour
  // hard to reason about and impossible to test. This is one element and a
  // rAF-throttled passive listener, so the cost is nil.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let done = false;
    let raf = 0;

    /** Meaningfully in view — the top edge is up into the viewport, not a 1px peek. */
    const inView = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      return r.top < vh * 0.75 && r.bottom > 0;
    };

    const check = () => {
      raf = 0;
      if (done) return;
      if (document.visibilityState !== "visible") return;
      if (!inView()) return;
      done = true;
      teardown();
      trackOfferViewed(where);
    };

    const schedule = () => {
      if (done || raf) return;
      raf = requestAnimationFrame(check);
    };

    function teardown() {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("visibilitychange", schedule);
    }

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    document.addEventListener("visibilitychange", schedule);
    schedule(); // already on screen on mount (desktop, short pages)

    return teardown;
  }, [where]);

  const lucky = chart ? LUCKY[chart.mulank] : null;
  const missing = chart?.loShu.missing ?? [];
  const repeated = chart?.loShu.repeated ?? [];

  return (
    <div ref={ref} className="form-card" style={{ marginTop: 22 }}>
      <div className="preview" style={{ marginTop: 0, paddingTop: 0, borderTop: "none" }}>
        <div className="preview-label">Your complete report</div>

        <p className="sub" style={{ marginTop: 8, fontSize: 14 }}>
          A little more of what your chart already says.
        </p>

        {chart && (
          <>
            {/* Their actual Lo Shu grid. A real finding about them beats any
                description of what the report "includes". */}
            <div className="chart-block">
              <div className="chart-block-label">Your Lo Shu grid</div>
              <div className="loshu">
                {LO_SHU_LAYOUT.map((row, i) => (
                  <div className="loshu-row" key={i}>
                    {row.map((digit) => {
                      const count = chart.loShu.counts[digit];
                      return (
                        <div
                          key={digit}
                          className={`loshu-cell${count === 0 ? " is-empty" : ""}${count > 1 ? " is-strong" : ""}`}
                        >
                          {count === 0 ? "" : String(digit).repeat(count)}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              <p className="chart-note">
                {missing.length > 0 ? (
                  <>
                    You&apos;re missing <strong>{listOut(missing)}</strong>
                    {repeated.length > 0 && (
                      <>
                        , and carry a double <strong>{listOut(repeated)}</strong>
                      </>
                    )}
                    . Your report explains what each gap costs you and the remedy for it.
                  </>
                ) : (
                  <>
                    Every number 1–9 appears in your chart — that is genuinely rare. Your
                    report explains what a complete grid means for you.
                  </>
                )}
              </p>
            </div>

            {/* Lucky elements, as actual swatches rather than a promise of them. */}
            {lucky && (
              <div className="chart-block">
                <div className="chart-block-label">Your lucky elements</div>
                <div className="swatches">
                  {lucky.colors.map((c) => (
                    <div className="swatch" key={c.name}>
                      <span className="swatch-dot" style={{ background: c.hex }} aria-hidden />
                      <span>{c.name}</span>
                    </div>
                  ))}
                </div>
                <p className="chart-note">
                  <strong>{lucky.days}</strong> · {lucky.gemstone} · facing {lucky.direction}.
                  The report adds your metal, your mantra and the remedies for your ruling
                  planet.
                </p>
              </div>
            )}
          </>
        )}

        {/* One page you can actually read, swipe for the rest — three
            thumbnails at ~90px told the reader nothing. */}
        <div className="page-strip" role="group" aria-label="Sample report pages">
          {SAMPLE_PAGES.map((s) => (
            <figure className="page-strip-item" key={s.src}>
              <Image
                src={s.src}
                alt={s.alt}
                width={1191}
                height={1685}
                loading="lazy"
                sizes="(max-width: 620px) 62vw, 240px"
              />
              <figcaption>{s.caption}</figcaption>
            </figure>
          ))}
        </div>
        <p className="notice" style={{ marginTop: 2, marginBottom: 14 }}>
          Real pages from a sample report — swipe for more.
        </p>

        <p className="sub" style={{ marginTop: 4, fontSize: 14 }}>
          <strong style={{ color: "var(--gold-bright)" }}>{PRICE_LABEL}</strong> — ten designed
          pages, one payment, nothing recurring. In your inbox within 24 hours.
        </p>

        {children}
      </div>
    </div>
  );
}
