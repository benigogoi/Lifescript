import Link from "next/link";
import Image from "next/image";
import { Noto_Serif_Bengali, Noto_Sans_Bengali } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Mandala } from "@/components/Mandala";
import { SECTION_ICONS, ShieldCheckIcon, ClockIcon, SparkleIcon } from "@/components/icons";
import { pageMetadata } from "@/lib/seo";

// Same Bengali-script families the PDF report uses, so the page and the
// product the customer receives share one look.
const serifAs = Noto_Serif_Bengali({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-as-serif",
  display: "swap",
});
const sansAs = Noto_Sans_Bengali({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600"],
  variable: "--font-as-sans",
  display: "swap",
});

// NOTE: paused/unrouted page (see app/_as_paused). locale/languages support
// on pageMetadata is still local-only WIP, so this call is trimmed to the
// fields the committed pageMetadata() signature actually accepts.
export const metadata = pageMetadata({
  title: "Mystic Digits — আপোনাৰ ব্যক্তিগত অসমীয়া সংখ্যাতত্ত্ব ৰিপ’ৰ্ট",
  description:
    "আপোনাৰ নাম আৰু জন্ম তাৰিখৰ পৰা সম্পূৰ্ণ অসমীয়াত লিখা ১০-পৃষ্ঠাৰ বৈদিক সংখ্যাতত্ত্ব ৰিপ’ৰ্ট — মাত্ৰ ₹৯৯, আপোনাৰ ইমেইললৈ।",
  path: "/as",
});

const ORDER_HREF = "/order?lang=as";

const ACCENTS = ["gold", "red", "violet"] as const;

const SECTIONS = [
  { n: "০১", t: "মূলাংক", d: "আপোনাৰ জন্ম সংখ্যা — আপোনাৰ ব্যক্তিত্ব আৰু স্বভাৱৰ মূল।" },
  { n: "০২", t: "ভাগ্যাংক", d: "আপোনাৰ সম্পূৰ্ণ জন্ম তাৰিখৰ পৰা অহা ভাগ্যৰ সংখ্যা।" },
  { n: "০৩", t: "লো শ্যু গ্ৰিড", d: "আপোনাৰ ৩×৩ শক্তিৰ মানচিত্ৰ — আপুনি কঢ়িয়াই ফুৰা আৰু নথকা সংখ্যাবোৰ।" },
  { n: "০৪", t: "নামৰ সংখ্যা", d: "আপোনাৰ নামৰ ধ্বনিয়ে আপোনাক কি দিয়ে, আৰু তাক কেনেকৈ ব্যৱহাৰ কৰিব।" },
  { n: "০৫", t: "আগন্তুক বছৰ", d: "আপুনি এতিয়া থকা বছৰটোৰ বাবে এক ব্যক্তিগত বিশ্লেষণ।" },
  { n: "০৬", t: "তাৰ পিছৰ বছৰ", d: "অহা বছৰে কি লৈ আহিছে, আৰু তাৰ বাবে কেনেকৈ সাজু হ’ব।" },
  { n: "০৭", t: "শুভ উপাদান", d: "আপোনাৰ শুভ ৰং, দিন, ৰত্ন, ধাতু আৰু দিশ।" },
  { n: "০৮", t: "বৈদিক প্ৰতিকাৰ", d: "আপোনাৰ অধিপতি গ্ৰহৰ লগত মিলা সৰল, প্ৰামাণিক প্ৰতিকাৰ।" },
  { n: "০৯", t: "আপোনাৰ মন্ত্ৰ", d: "আপোনাৰ সংখ্যাক শক্তিশালী কৰিবলৈ বাছি লোৱা এটা মন্ত্ৰ।" },
  { n: "১০", t: "সামৰণিৰ আশীৰ্বাদ", d: "আপোনাৰ পঢ়াখিনি আগলৈ লৈ যাবলৈ এটি আন্তৰিক, ব্যক্তিগত টোকা।" },
];

const SAMPLE_PAGES = [
  {
    src: "/samples/sample-cover.webp",
    alt: "নমুনা ৰিপ’ৰ্টৰ কভাৰ পৃষ্ঠা — ক’লা আৰু সোণালী বৈদিক ডিজাইন",
    caption: "আপোনাৰ নামেৰে, সোণালী আখৰত কভাৰ",
  },
  {
    src: "/samples/sample-loshu.webp",
    alt: "নমুনা লো শ্যু গ্ৰিড পৃষ্ঠা — থকা আৰু নথকা সংখ্যাৰ সৈতে",
    caption: "আপোনাৰ লো শ্যু গ্ৰিড আৰু শক্তিৰ দিশবোৰ",
  },
  {
    src: "/samples/sample-lucky.webp",
    alt: "নমুনা শুভ উপাদান পৃষ্ঠা — ৰং, দিন, ৰত্ন, ধাতু আৰু দিশ",
    caption: "আপোনাৰ শুভ ৰং, দিন আৰু ৰত্ন",
  },
];

const STEPS = [
  { n: "১", t: "আপোনাৰ তথ্য দিয়ক", d: "কেৱল আপোনাৰ সম্পূৰ্ণ নাম আৰু জন্ম তাৰিখ — আন একো নালাগে।" },
  { n: "২", t: "আমি আপোনাৰ ৰিপ’ৰ্ট প্ৰস্তুত কৰোঁ", d: "আপোনাৰ সংখ্যাবোৰ বিশ্লেষণ কৰি ১০-পৃষ্ঠাৰ ৰিপ’ৰ্টখন সম্পূৰ্ণ অসমীয়াত লিখা হয়।" },
  { n: "৩", t: "আপোনাৰ ইনবক্সলৈ", d: "২৪ ঘণ্টাৰ ভিতৰত এখন সুন্দৰ PDF আহি পায় — চিৰদিনৰ বাবে ৰাখিব পৰাকৈ।" },
];

export default function HomeAssamese() {
  return (
    <div lang="as" className={`${serifAs.variable} ${sansAs.variable} page-as`}>
      <SiteHeader />

      <main className="wrap">
        <section className="hero">
          <Mandala className="hero-mandala" />
          <div className="eyebrow">ভাৰতীয় · বৈদিক সংখ্যাতত্ত্ব</div>
          <h1>
            আপোনাৰ জীৱন, <em>সংখ্যাৰে</em> লিখা।
          </h1>
          <h2 className="hero-subtitle">ব্যক্তিগত বৈদিক সংখ্যাতত্ত্ব ৰিপ’ৰ্ট — সম্পূৰ্ণ অসমীয়াত</h2>
          <p className="lede">
            আপোনাৰ নাম আৰু জন্ম তাৰিখৰ পৰা কেৱল আপোনাৰ বাবেই প্ৰস্তুত কৰা এখন সুন্দৰ ১০-পৃষ্ঠাৰ
            সংখ্যাতত্ত্ব ৰিপ’ৰ্ট — আপোনাৰ মূলাংক, ভাগ্যাংক, লো শ্যু গ্ৰিড, আগন্তুক বছৰ আৰু আপোনাৰ
            ব্যক্তিগত বৈদিক প্ৰতিকাৰ। আপোনাৰ ইমেইললৈ প্ৰেৰণ কৰা হয়।
          </p>
          <Link href={ORDER_HREF} className="cta">
            মোৰ ৰিপ’ৰ্ট লাগে
          </Link>
          <div className="price-note">
            মাত্ৰ <strong>₹৯৯</strong> · ২৪ ঘণ্টাৰ ভিতৰত ডেলিভাৰী
          </div>
          <p className="hero-calc-note">
            অৰ্ডাৰৰ আগতে নিজৰ সংখ্যা চাব খোজেনে? আমাৰ বিনামূলীয়া কেলকুলেটৰেৰে কেইছেকেণ্ডতে আপোনাৰ
            মূলাংক — জন্ম সংখ্যা — আৰু ভাগ্যাংক উলিয়াওক। সাজু হ’লে, আপোনাৰ সম্পূৰ্ণ ৰিপ’ৰ্টে এই
            সংখ্যাবোৰ একেলগে, গভীৰভাৱে আৰু ব্যক্তিগতভাৱে পঢ়ি শুনায়।
          </p>
          <div>
            <Link href="/calculator" className="cta cta-ghost cta-sm">
              বিনামূলীয়া মূলাংক কেলকুলেটৰ চাওক →
            </Link>
          </div>

          <div className="trust-row">
            <div className="trust-badge">
              <ShieldCheckIcon />
              প্ৰকৃত বৈদিক সংখ্যাতত্ত্বৰ আধাৰত গণনা
            </div>
            <div className="trust-badge">
              <SparkleIcon />
              বিনামূলীয়া তৎক্ষণাত প্ৰিভিউ, ছাইন-আপ নালাগে
            </div>
            <div className="trust-badge">
              <ClockIcon />
              ২৪ ঘণ্টাৰ ভিতৰত ডেলিভাৰী
            </div>
          </div>

          <p className="lang-switch">
            <Link href="/">Read this page in English →</Link>
          </p>
        </section>

        <section className="block" id="inside">
          <div className="section-head">
            <h2>আপোনাৰ ৰিপ’ৰ্টত কি কি থাকে</h2>
            <div className="divider" />
            <p className="sub">দহটা পৃষ্ঠা — কেৱল আপোনাৰ বাবে লিখা, আন কাৰো বাবে নহয়।</p>
          </div>
          <div className="grid">
            {SECTIONS.map((s, i) => {
              const Icon = SECTION_ICONS[i];
              const accent = ACCENTS[i % ACCENTS.length];
              return (
                <div className="card" data-accent={accent} key={s.n}>
                  <div className="card-top">
                    <Icon className="icon" />
                    <div className="num">{s.n}</div>
                  </div>
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="block" id="sample">
          <div className="section-head">
            <h2>নিজেই চাই লওক</h2>
            <div className="divider" />
            <p className="sub">
              অনন্যাৰ নমুনা ৰিপ’ৰ্টৰ প্ৰকৃত পৃষ্ঠা (ইংৰাজী সংস্কৰণ)। আপোনাৰখন আপোনাৰ সংখ্যাৰ পৰা,
              সম্পূৰ্ণ অসমীয়াত প্ৰস্তুত কৰা হ’ব — কোনো দুখন ৰিপ’ৰ্ট একে নহয়।
            </p>
          </div>
          <div className="samples">
            {SAMPLE_PAGES.map((s) => (
              <figure className="sample-page" key={s.src}>
                <Image src={s.src} alt={s.alt} width={1191} height={1685} loading="lazy" />
                <figcaption>{s.caption}</figcaption>
              </figure>
            ))}
          </div>
          <div className="samples-cta">
            <Link href={ORDER_HREF} className="cta cta-ghost cta-sm">
              আপোনাৰ সংখ্যাৰ বাবে লিখা — আপোনাৰখন লওক →
            </Link>
          </div>
        </section>

        <section className="block" id="how">
          <div className="section-head">
            <h2>কেনেকৈ কাম কৰে</h2>
            <div className="divider" />
          </div>
          <div className="steps">
            {STEPS.map((s) => (
              <div className="step" key={s.n}>
                <div className="circle">{s.n}</div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="block" style={{ textAlign: "center" }}>
          <div className="section-head">
            <h2>আপোনাৰখন পঢ়িবলৈ সাজুনে?</h2>
            <div className="divider" />
            <p className="sub">আৰম্ভ কৰিবলৈ এমিনিটও নালাগে।</p>
          </div>
          <Link href={ORDER_HREF} className="cta">
            মোৰ ৰিপ’ৰ্ট লাগে · ₹৯৯
          </Link>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
