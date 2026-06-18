import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { MailIcon, ClockIcon, ShieldCheckIcon } from "@/components/icons";

export const metadata = {
  title: "Contact Us — LifeScript",
  description: "Get in touch with LifeScript for questions about your numerology report, an order, or anything else.",
};

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main className="wrap">
        <div className="page-hero">
          <div className="eyebrow">Get in Touch</div>
          <h1>We're happy to help.</h1>
          <p>Questions about your report, an order, or anything else — reach out anytime.</p>
        </div>

        <div className="contact-grid" style={{ marginBottom: 64 }}>
          <div className="contact-card">
            <MailIcon />
            <div>
              <h3>Email</h3>
              <a href="mailto:support@lifescript.co.in">support@lifescript.co.in</a>
            </div>
          </div>
          <div className="contact-card">
            <ClockIcon />
            <div>
              <h3>Response time</h3>
              <p>We reply within 24–48 hours, every day of the week.</p>
            </div>
          </div>
          <div className="contact-card">
            <ShieldCheckIcon />
            <div>
              <h3>Order support</h3>
              <p>Include your order email and the name on your report for the fastest help.</p>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
