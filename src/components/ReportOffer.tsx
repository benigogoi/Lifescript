"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { PRICE_LABEL } from "@/lib/pricing";
import { trackOfferViewed } from "@/lib/analytics";

/**
 * The paid product, shown immediately under a visitor's free result.
 *
 * The free numbers are available everywhere on the internet; what is not is the
 * artifact — a designed, personalised document someone keeps. So this block
 * leads with real pages from a real report rather than a feature list.
 *
 * No testimonials, no counts, no countdowns: nothing here is claimed that isn't
 * verifiably true of the product.
 */

const SAMPLE_PAGES = [
  { src: "/samples/sample-cover.webp", alt: "Report cover page with the reader's name set in gold", caption: "Your cover, with your name in gold" },
  { src: "/samples/sample-loshu.webp", alt: "Lo Shu grid page showing planes and arrows", caption: "Your Lo Shu grid, planes & arrows" },
  { src: "/samples/sample-lucky.webp", alt: "Lucky elements page showing colours, days and gemstone", caption: "Your lucky colours, days & gemstone" },
];

const INCLUDED = [
  "Mulank & Bhagyank, read together rather than separately",
  "Your Lo Shu grid — the numbers you carry and the ones you're missing",
  "Your Name Number, and how its vibration works with your birth numbers",
  "A personal reading for this year and the next",
  "Lucky colours, days, gemstone, metal and direction",
  "Vedic remedies and a mantra chosen for your ruling planet",
];

export function ReportOffer({
  where,
  children,
}: {
  /** Which page this is rendered on — kept on the analytics events. */
  where: "calculator" | "order";
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

  return (
    <div ref={ref} className="form-card" style={{ marginTop: 22 }}>
      <div className="preview" style={{ marginTop: 0, paddingTop: 0, borderTop: "none" }}>
        <div className="preview-label">Your complete report</div>

        <p className="sub" style={{ marginTop: 10 }}>
          You&apos;ve seen your numbers. The full report is the part you keep — ten designed pages,
          written for your chart alone, delivered as a PDF you can save, revisit, share or gift.
        </p>

        <div className="samples samples-compact" style={{ marginTop: 20 }}>
          {SAMPLE_PAGES.map((s) => (
            <figure className="sample-page" key={s.src}>
              <Image
                src={s.src}
                alt={s.alt}
                width={1191}
                height={1685}
                loading="lazy"
                sizes="(max-width: 620px) 30vw, 180px"
              />
              <figcaption>{s.caption}</figcaption>
            </figure>
          ))}
        </div>

        <p className="notice" style={{ marginTop: 20, marginBottom: 14 }}>
          Real pages from a sample report. Yours is written from your numbers alone.
        </p>

        <ul className="preview-traits" style={{ textAlign: "left", maxWidth: 460, margin: "0 auto" }}>
          {INCLUDED.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>

        <p className="sub" style={{ marginTop: 18, fontSize: 14 }}>
          <strong style={{ color: "var(--gold-bright)" }}>{PRICE_LABEL}</strong> — one payment,
          nothing recurring. Delivered to your inbox within 24 hours.
        </p>

        {children}
      </div>
    </div>
  );
}
