import type { MetadataRoute } from "next";

const BASE_URL = "https://mysticdigits.in";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/order",
    "/calculator",
    ...Array.from({ length: 9 }, (_, i) => `/mulank/${i + 1}`),
    "/about",
    "/faq",
    "/contact",
    "/privacy",
    "/terms",
    "/refund",
  ];

  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority:
      route === ""
        ? 1
        : route === "/order"
          ? 0.9
          : route === "/calculator" || route.startsWith("/mulank/")
            ? 0.7
            : 0.5,
  }));
}
