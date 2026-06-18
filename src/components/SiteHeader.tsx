import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header-inner wrap">
        <Link href="/" className="wordmark">
          Life<span>Script</span>
        </Link>
        <nav className="site-nav" aria-label="Primary">
          <Link href="/about">About</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/order" className="cta cta-sm">
            Get My Report
          </Link>
        </nav>
      </div>
    </header>
  );
}
