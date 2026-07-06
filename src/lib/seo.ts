import type { Metadata } from "next";

export const BASE_URL = "https://mysticdigits.in";
export const SITE_NAME = "Mystic Digits";

// Official social profiles — used in the footer and in Organization `sameAs`.
export const SOCIAL_LINKS = {
  facebook: "https://www.facebook.com/profile.php?id=61591197721956",
  instagram: "https://www.instagram.com/mysticdigits.in/",
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
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
