"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="site-header">
      <div className="site-header-inner wrap">
        <Link href="/" className="brand-link">
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
          <Link href="/calculator" onClick={closeMenu}>Free Mulank Calculator</Link>
          <Link href="/about" onClick={closeMenu}>About</Link>
          <Link href="/faq" onClick={closeMenu}>FAQ</Link>
          <Link href="/order" className="cta cta-sm" onClick={closeMenu}>
            Get My Report
          </Link>
        </nav>
      </div>
    </header>
  );
}
