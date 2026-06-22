import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div className="footer-brand">
          <div className="wordmark">
            Mystic<span>Digits</span>
          </div>
          <p>Indian Vedic numerology, calculated from your own name and date of birth.</p>
        </div>

        <div className="footer-col">
          <div className="footer-h">Company</div>
          <Link href="/about">About Us</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/contact">Contact</Link>
        </div>

        <div className="footer-col">
          <div className="footer-h">Legal</div>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms &amp; Conditions</Link>
          <Link href="/refund">Refund Policy</Link>
        </div>

        <div className="footer-col">
          <div className="footer-h">Get in touch</div>
          <a href="mailto:support@mysticdigits.in">support@mysticdigits.in</a>
        </div>
      </div>
      <div className="wrap footer-bottom">
        &copy; {new Date().getFullYear()} Mystic Digits. All rights reserved.
      </div>
    </footer>
  );
}
