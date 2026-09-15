"use client";

import Link from "next/link";
import { useEffect, useState, type RefObject } from "react";

/**
 * A fixed "Get My Full Report" bar along the bottom of the screen. Only
 * rendered once the visitor has their free numbers, and hidden whenever the
 * real buy button (`targetRef`) is on screen — two buy buttons in view at
 * once just compete with each other.
 */
export function StickyReportBar({
  targetRef,
  label,
  priceLabel,
  note,
  href,
  onClick,
}: {
  targetRef: RefObject<HTMLElement | null>;
  label: string;
  priceLabel: string;
  note: string;
  href?: string;
  onClick?: () => void;
}) {
  const [targetVisible, setTargetVisible] = useState(true);

  // A rAF-throttled scroll listener rather than IntersectionObserver, for the
  // same reason as ReportOffer: IO callbacks stop firing while a document is
  // hidden, which left the bar stuck in the wrong state.
  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      const el = targetRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      setTargetVisible(r.top < vh && r.bottom > 0);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    check();
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [targetRef]);

  const show = !targetVisible;
  const tabIndex = show ? 0 : -1;

  return (
    <div className={`sticky-buy${show ? " is-visible" : ""}`} aria-hidden={!show}>
      <div className="sticky-buy-inner">
        <div className="sticky-buy-price">
          <strong>{priceLabel}</strong>
          <span>{note}</span>
        </div>
        {href ? (
          <Link href={href} className="cta sticky-buy-cta" tabIndex={tabIndex} onClick={onClick}>
            {label}
          </Link>
        ) : (
          <button type="button" className="cta sticky-buy-cta" tabIndex={tabIndex} onClick={onClick}>
            {label}
          </button>
        )}
      </div>
    </div>
  );
}
