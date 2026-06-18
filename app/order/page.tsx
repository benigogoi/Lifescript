import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import OrderForm from "./OrderForm";

export const metadata = {
  title: "Get Your Report — LifeScript",
  description: "Enter your name and date of birth to get your free preview and order your full 10-page LifeScript numerology report.",
};

export default function OrderPage() {
  return (
    <>
      <SiteHeader />

      <main className="wrap">
        <div className="section-head" style={{ marginTop: 24 }}>
          <h2>Begin your reading</h2>
          <div className="divider" />
          <p className="sub">Enter your details exactly as you'd like them to appear on your report.</p>
        </div>
        <OrderForm />
      </main>

      <SiteFooter />
    </>
  );
}
