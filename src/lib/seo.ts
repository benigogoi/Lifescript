import type { Metadata } from "next";
import { PRICE_INR } from "@/lib/order";

export const BASE_URL = "https://mysticdigits.in";
export const SITE_NAME = "Mystic Digits";

// Official social profiles — used in the footer and in Organization `sameAs`.
export const SOCIAL_LINKS = {
  facebook: "https://www.facebook.com/profile.php?id=61591197721956",
  instagram: "https://www.instagram.com/mysticdigits.in/",
} as const;

/**
 * The generated OG card (app/opengraph-image.tsx). Next only attaches the
 * file-convention image automatically when a page leaves `openGraph` alone —
 * `pageMetadata` always sets it, so every page has to name the image itself
 * or it ships with no social preview at all.
 */
export const OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "Mystic Digits — personalised Indian numerology reports",
} as const;

/**
 * Build the full per-page metadata set (title, description, canonical,
 * Open Graph, Twitter) for a route. `path` is the route path ("/" for home);
 * relative URLs are resolved against `metadataBase` from the root layout.
 *
 * Page-level `openGraph` replaces the root layout's entirely (Next does not
 * deep-merge it), so this includes siteName/locale/type on every page.
 */
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: SITE_NAME,
      locale: "en_IN",
      type: "website",
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE.url],
    },
  };
}

/** Publisher/author node reused across every schema graph on the site. */
export const organizationSchema = {
  "@type": "Organization",
  "@id": `${BASE_URL}/#organization`,
  name: SITE_NAME,
  url: BASE_URL,
  email: "support@mysticdigits.in",
  logo: { "@type": "ImageObject", url: `${BASE_URL}/logo.png` },
  sameAs: [SOCIAL_LINKS.facebook, SOCIAL_LINKS.instagram],
} as const;

/**
 * `alternateName` matters more than usual here: mysticaldigits.com is an
 * unrelated numerology site with a near-identical name, so spell out the
 * variants we want associated with this domain.
 */
export const websiteSchema = {
  "@type": "WebSite",
  "@id": `${BASE_URL}/#website`,
  name: SITE_NAME,
  alternateName: ["MysticDigits", "Mystic Digits India", "mysticdigits.in"],
  url: BASE_URL,
  inLanguage: "en-IN",
  publisher: { "@id": `${BASE_URL}/#organization` },
} as const;

/**
 * The paid report as a Product with its Offer. `priceValidUntil` is required
 * for the offer to stay eligible for rich results; it rolls a year forward so
 * it never silently goes stale.
 *
 * No `aggregateRating` — Google requires ratings to come from genuine
 * collected reviews, and inventing them risks a manual action. Add it only
 * once real buyer reviews are being stored.
 */
export function productSchema() {
  const validUntil = new Date();
  validUntil.setFullYear(validUntil.getFullYear() + 1);

  return {
    "@type": "Product",
    "@id": `${BASE_URL}/#report`,
    name: "Personalised Indian Numerology Report",
    description:
      "A 10-page Vedic numerology report prepared from your full name and date of birth — Mulank, Bhagyank, Lo Shu grid, name number, the year ahead, lucky elements, remedies and a personal mantra. Delivered as a PDF within 24 hours.",
    image: `${BASE_URL}/opengraph-image`,
    brand: { "@id": `${BASE_URL}/#organization` },
    category: "Numerology Report",
    offers: {
      "@type": "Offer",
      url: `${BASE_URL}/order`,
      price: String(PRICE_INR),
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      priceValidUntil: validUntil.toISOString().slice(0, 10),
      seller: { "@id": `${BASE_URL}/#organization` },
    },
  };
}

/** Wrap schema nodes in a single `@graph` document. */
export function schemaGraph(...nodes: object[]) {
  return { "@context": "https://schema.org", "@graph": nodes };
}
