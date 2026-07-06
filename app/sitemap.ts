import type { MetadataRoute } from "next";
import { BASE_URL } from "@/lib/seo";

/**
 * Real last-content-change dates per route. Bump the relevant entry whenever
 * a page's visible content changes — Google ignores lastmod if it is
 * obviously fake (e.g. every URL changing on every build).
 */
const LAST_MODIFIED: Record<string, string> = {
  "": "2026-07-06",
  "/order": "2026-07-06",
  "/calculator": "2026-07-06",
  "/about": "2026-07-06",
  "/faq": "2026-07-06",
  "/contact": "2026-07-06",
  "/privacy": "2026-07-06",
  "/terms": "2026-07-06",
  "/refund": "2026-07-06",
};
const MULANK_MODIFIED = "2026-07-06";
const BHAGYANK_MODIFIED = "2026-07-06";

export default function sitemap(): MetadataRoute.Sitemap {
  const numbered = (prefix: string, lastModified: string) =>
    Array.from({ length: 9 }, (_, i) => ({
      url: `${BASE_URL}${prefix}${i + 1}`,
      lastModified: new Date(lastModified),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  const staticRoutes = Object.entries(LAST_MODIFIED).map(([route, date]) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(date),
    changeFrequency: (route === "" ? "weekly" : "monthly") as "weekly" | "monthly",
    priority:
      route === "" ? 1 : route === "/order" ? 0.9 : route === "/calculator" ? 0.7 : 0.5,
  }));

  return [
    ...staticRoutes,
    ...numbered("/mulank/", MULANK_MODIFIED),
    ...numbered("/bhagyank/", BHAGYANK_MODIFIED),
  ];
}
