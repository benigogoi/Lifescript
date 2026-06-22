import type { Metadata } from "next";
import { Cormorant_Garamond, Marcellus, Jost } from "next/font/google";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});
const label = Marcellus({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-label",
  display: "swap",
});
const body = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const BASE_URL = "https://mysticdigits.in";
const SITE_TITLE = "Mystic Digits — Your Personalised Indian Numerology Report";
const SITE_DESCRIPTION =
  "A beautiful 10-page Vedic numerology report written uniquely for your name and date of birth. Delivered to your inbox.";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: BASE_URL,
    siteName: "Mystic Digits",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  verification: { google: "hBgjp_GVxUvU11YBIGPjf9-m4I-FFBDYKtcjt-PsAOQ" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Mystic Digits",
    url: BASE_URL,
    description: SITE_DESCRIPTION,
    email: "support@mysticdigits.in",
  };

  return (
    <html lang="en">
      <body className={`${display.variable} ${label.variable} ${body.variable}`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <div className="starfield" aria-hidden />
        {children}
      </body>
    </html>
  );
}
