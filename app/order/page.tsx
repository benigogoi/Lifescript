import { Suspense } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { pageMetadata, productSchema, schemaGraph, BASE_URL } from "@/lib/seo";
import OrderForm from "./OrderForm";
import { PRICE_LABEL } from "@/lib/pricing";

export const metadata = pageMetadata({
  title: "Get Your Numerology Report — Mystic Digits",
  description: `See your Mulank, Bhagyank and Name Number free — no signup. Then get your complete 27-page personalised Vedic numerology report for ${PRICE_LABEL}, delivered within 24 hours.`,
  path: "/order",
});

/**
 * No `searchParams` read here on purpose — awaiting it opted the whole route
 * into dynamic rendering (X-Vercel-Cache: MISS on every request) and pushed
 * the metadata behind a Suspense boundary, so the head streamed after the
 * body. Assamese is paused and OrderForm ignores `initialLang` today; when
 * language selection returns, read `?lang=` client-side with useSearchParams
 * inside OrderForm so this shell stays static.
 */
export default function OrderPage() {
  const jsonLd = schemaGraph(productSchema(), {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Get Your Report", item: `${BASE_URL}/order` },
    ],
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />

      <main className="wrap">
        <div className="section-head" style={{ marginTop: 24 }}>
          <h1>Get Your Personalised Numerology Report</h1>
          <div className="divider" />
          <p className="sub">
            See your core numbers free — just your name and date of birth. No signup, and we
            only ask for an email if you decide you want the full report.
          </p>
        </div>
        <Suspense fallback={<div className="form-card" aria-busy="true" />}>
          <OrderForm />
        </Suspense>
      </main>

      <SiteFooter />
    </>
  );
}
