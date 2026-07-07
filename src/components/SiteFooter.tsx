import Image from "next/image";
import Link from "next/link";
import { SOCIAL_LINKS } from "@/lib/seo";
import { FacebookIcon, InstagramIcon } from "@/components/icons";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div className="footer-brand">
          <Image src="/logo.png" alt="Mystic Digits" width={140} height={140} className="logo-img footer-logo" />
          <p>Indian Vedic numerology, calculated from your own name and date of birth.</p>
        </div>

        <div className="footer-col">
          <div className="footer-h">Company</div>
          <Link href="/about">About Us</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/calculator">Free Mulank Calculator</Link>
        </div>

        <div className="footer-col">
          <div className="footer-h">Mulank Meanings</div>
          <div className="footer-mulank">
            {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
              <Link key={n} href={`/mulank/${n}`} aria-label={`Mulank ${n} meaning`}>
                {n}
              </Link>
            ))}
          </div>
          <div className="footer-h" style={{ marginTop: 14 }}>
            Bhagyank Meanings
          </div>
          <div className="footer-mulank">
            {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
              <Link key={n} href={`/bhagyank/${n}`} aria-label={`Bhagyank ${n} meaning`}>
                {n}
              </Link>
            ))}
          </div>
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
          <div className="footer-social">
            <a
              href={SOCIAL_LINKS.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Mystic Digits on Facebook"
            >
              <FacebookIcon />
            </a>
            <a
              href={SOCIAL_LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Mystic Digits on Instagram"
            >
              <InstagramIcon />
            </a>
          </div>
        </div>
      </div>
      <div className="wrap footer-bottom">
        &copy; {new Date().getFullYear()} Mystic Digits. All rights reserved.
      </div>
    </footer>
  );
}
