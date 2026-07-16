import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { pageMetadata } from "@/lib/seo";
import { isReportLang } from "@/lib/report-lang";
import OrderForm from "./OrderForm";

export const metadata = pageMetadata({
  title: "Get Your Report — Mystic Digits",
  description: "Enter your name and date of birth to get your free preview and order your full 10-page Mystic Digits numerology report.",
  path: "/order",
});

export default async function OrderPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  // Ad links can pre-select the report language: /order?lang=as
  const { lang } = await searchParams;
  const initialLang = isReportLang(lang) ? lang : "en";

  return (
    <>
      <SiteHeader />

      <main className="wrap">
        <div className="section-head" style={{ marginTop: 24 }}>
          <h2>Begin your reading</h2>
          <div className="divider" />
          <p className="sub">Enter your details exactly as you'd like them to appear on your report.</p>
        </div>
        <OrderForm initialLang={initialLang} />
      </main>

      <SiteFooter />
    </>
  );
}
