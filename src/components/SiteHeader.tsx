"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const NAV_STRINGS = {
  en: {
    home: "/",
    calculator: "Free Mulank Calculator",
    about: "About",
    faq: "FAQ",
    cta: "Get My Report",
    ctaHref: "/order",
  },
  as: {
    home: "/as",
    calculator: "বিনামূলীয়া মূলাংক কেলকুলেটৰ",
    about: "আমাৰ বিষয়ে",
    faq: "সচৰাচৰ প্ৰশ্ন",
    cta: "মোৰ ৰিপ’ৰ্ট লাগে",
    ctaHref: "/order?lang=as",
  },
} as const;

export function SiteHeader({ lang = "en" }: { lang?: keyof typeof NAV_STRINGS }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const t = NAV_STRINGS[lang];

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="site-header">
      <div className="site-header-inner wrap">
        <Link href={t.home} className="brand-link">
          <Image src="/logo.png" alt="Mystic Digits" width={140} height={140} className="logo-img" priority />
        </Link>
        <button
          type="button"
          className="menu-toggle"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-controls="primary-nav"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
        <nav id="primary-nav" className={`site-nav${menuOpen ? " is-open" : ""}`} aria-label="Primary">
          <Link href="/calculator" onClick={closeMenu}>{t.calculator}</Link>
          <Link href="/about" onClick={closeMenu}>{t.about}</Link>
          <Link href="/faq" onClick={closeMenu}>{t.faq}</Link>
          <Link href={t.ctaHref} className="cta cta-sm" onClick={closeMenu}>
            {t.cta}
          </Link>
        </nav>
      </div>
    </header>
  );
}
