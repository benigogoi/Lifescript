import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mystic Digits — Indian Vedic Numerology Reports",
    short_name: "Mystic Digits",
    description:
      "Personalised Indian Vedic numerology reports calculated from your name and date of birth.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b0a12",
    theme_color: "#c9a84c",
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
