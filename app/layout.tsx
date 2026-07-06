import type { Metadata } from "next";
import { Cormorant_Garamond, Marcellus, Jost } from "next/font/google";
import Script from "next/script";
import { AttributionCapture } from "@/components/AttributionCapture";
import { BASE_URL, SOCIAL_LINKS } from "@/lib/seo";
import "./globals.css";

const GA_MEASUREMENT_ID = "G-9S182GLZY6";
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
// Set NEXT_PUBLIC_GA_DEBUG=1 (e.g. on a preview deploy) to surface every hit
// in GA4 DebugView without installing the GA Debugger extension.
const GA_DEBUG = process.env.NEXT_PUBLIC_GA_DEBUG === "1";

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
    sameAs: [SOCIAL_LINKS.facebook, SOCIAL_LINKS.instagram],
  };

  return (
    <html lang="en">
      <body className={`${display.variable} ${label.variable} ${body.variable}`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}'${GA_DEBUG ? ", { debug_mode: true }" : ""});
          `}
        </Script>
        {META_PIXEL_ID && (
          <>
            <Script id="meta-pixel-init" strategy="afterInteractive">
              {`
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${META_PIXEL_ID}');
                fbq('track', 'PageView');
              `}
            </Script>
            <noscript>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                height="1"
                width="1"
                style={{ display: "none" }}
                src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>
          </>
        )}
        <AttributionCapture />
        <div className="starfield" aria-hidden />
        {children}
      </body>
    </html>
  );
}
