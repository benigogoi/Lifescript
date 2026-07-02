import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ShieldCheckIcon, ClockIcon } from "@/components/icons";
import { BackGuard } from "./BackGuard";
import { PurchaseTracker } from "./PurchaseTracker";

export const metadata = {
  title: "Order Status — Mystic Digits",
  robots: { index: false, follow: false },
};

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; order?: string }>;
}) {
  const { status, order } = await searchParams;
  const failed = status === "failed";

  return (
    <>
      <BackGuard />
      {/* Purchase conversion (GA4 + Meta) — only with a verified order id,
          and trackPurchase() dedupes per order so refreshes don't refire. */}
      {!failed && order && <PurchaseTracker orderId={order} />}
      <SiteHeader />

      <main className="wrap">
        <div className="status-card" data-state={failed ? "failed" : "success"}>
          {failed ? (
            <>
              <div className="status-mark failed">!</div>
              <h1>Payment didn&apos;t go through</h1>
              <p className="sub">
                Your payment couldn&apos;t be completed, so no report was ordered. If any money was
                deducted, it will be reversed automatically — and you can try again anytime.
              </p>
              <p className="status-note">
                Need help? Email{" "}
                <a href="mailto:support@mysticdigits.in">support@mysticdigits.in</a>.
              </p>
            </>
          ) : (
            <>
              <div className="status-mark success">✓</div>
              <h1>Thank you — your order is confirmed</h1>
              <p className="sub">
                Your payment was received. Your personalised 10-page numerology report is being
                prepared and will arrive in your inbox <strong>within 24 hours</strong>.
              </p>
              <div className="status-badges">
                <span className="trust-badge">
                  <ShieldCheckIcon />
                  Payment secure &amp; confirmed
                </span>
                <span className="trust-badge">
                  <ClockIcon />
                  Delivered within 24 hours
                </span>
              </div>
            </>
          )}

          <Link href="/" className={`cta${failed ? " cta-ghost" : ""}`} style={{ marginTop: 28 }}>
            Back to Home
          </Link>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
