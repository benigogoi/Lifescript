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

export const metadata: Metadata = {
  title: "LifeScript — Your Personalised Indian Numerology Report",
  description:
    "A beautiful 10-page Vedic numerology report written uniquely for your name and date of birth. Delivered to your inbox.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${label.variable} ${body.variable}`}>
        <div className="starfield" aria-hidden />
        {children}
      </body>
    </html>
  );
}
