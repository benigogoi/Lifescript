import type { MetadataRoute } from "next";

const BASE_URL = "https://lifescript.co.in";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/order", "/about", "/faq", "/contact", "/privacy", "/terms", "/refund"];

  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "/order" ? 0.9 : 0.5,
  }));
}
