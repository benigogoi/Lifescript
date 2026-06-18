import Link from "next/link";
import OrderForm from "./OrderForm";

export const metadata = {
  title: "Get your report — LifeScript",
};

export default function OrderPage() {
  return (
    <>
      <header className="site-header">
        <Link href="/" className="wordmark">
          Life<span>Script</span>
        </Link>
      </header>

      <main className="wrap">
        <div className="section-head" style={{ marginTop: 24 }}>
          <h2>Begin your reading</h2>
          <div className="divider" />
          <p className="sub">Enter your details exactly as you'd like them to appear on your report.</p>
        </div>
        <OrderForm />
      </main>

      <footer className="site-footer">
        <div className="wrap">LifeScript · Indian numerology, beautifully prepared.</div>
      </footer>
    </>
  );
}
