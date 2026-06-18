import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata = {
  title: "FAQ — LifeScript",
  description: "Answers to common questions about LifeScript numerology reports — pricing, delivery, accuracy, payments, and privacy.",
};

const FAQS = [
  {
    q: "What do I need to provide to get my report?",
    a: "Just your full name and date of birth. We use these to calculate your Mulank, Bhagyank, Lo Shu grid, and Name Number — nothing else is required.",
  },
  {
    q: "How is my report calculated?",
    a: "We use classical Vedic and Chaldean numerology methods: your Mulank from your birth date, Bhagyank from your full date of birth, your Name Number from the Chaldean letter-value system, and your Lo Shu grid from the digits in your date of birth.",
  },
  {
    q: "How long does delivery take?",
    a: "Your full report is prepared and delivered to your email inbox as a PDF within 24 hours of payment, usually much sooner.",
  },
  {
    q: "Can I see a preview before I pay?",
    a: "Yes. Enter your name and date of birth on the order page and we'll instantly show you your core numbers for free, with no signup required. The ₹99 payment is only for the complete 10-page report.",
  },
  {
    q: "What payment methods are accepted?",
    a: "We use a secure third-party payment gateway supporting cards, UPI, and net banking.",
  },
  {
    q: "Is my personal information kept private?",
    a: "Yes. We only use your name and date of birth to calculate and prepare your report, and we never sell or share your details with third parties. See our Privacy Policy for full details.",
  },
  {
    q: "What if I'm not happy with my report?",
    a: "Since each report is generated specifically for you the moment you order, we're unable to offer refunds once it has been delivered. If something went wrong with your order, contact us and we'll make it right. See our Refund Policy for details.",
  },
  {
    q: "Will my report change next year?",
    a: "Your core numbers (Mulank, Bhagyank, Name Number) stay the same for life. The year-ahead reading is specific to the current and following year, so it will naturally read differently if you order again later.",
  },
];

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader />
      <main className="wrap">
        <div className="page-hero">
          <div className="eyebrow">Frequently Asked</div>
          <h1>Questions, answered.</h1>
          <p>Everything you need to know before ordering your report.</p>
        </div>

        <div className="faq-list" style={{ marginBottom: 64 }}>
          {FAQS.map((f) => (
            <details className="faq-item" key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
