"use client";

import Link from "next/link";
import { trackGA, trackMetaCustom } from "@/lib/analytics";

/**
 * The poster's buy button → the existing /order checkout. Tracked as its own
 * custom event rather than AddToCart, because /order fires AddToCart again
 * when they tap buy there — counting it twice would inflate the funnel.
 */
export function PosterCta({
  slug,
  position,
  label,
  className,
}: {
  slug: string;
  position: "top" | "bottom";
  label: string;
  className: string;
}) {
  return (
    <Link
      href="/order"
      className={className}
      onClick={() => {
        trackGA("poster_cta_clicked", { poster: slug, position });
        trackMetaCustom("PosterCtaClicked", { poster: slug, position });
      }}
    >
      {label}
    </Link>
  );
}
