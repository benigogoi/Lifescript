"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PRICE_LABEL } from "@/lib/pricing";
import type { ReportLang } from "@/lib/report-lang";
import { DobFields, type DobValue } from "@/components/DobFields";
import { ReportOffer } from "@/components/ReportOffer";
import {
  trackCalculatorStarted,
  trackFreeResultViewed,
  trackPaidCtaClicked,
  trackBeginCheckout,
} from "@/lib/analytics";
import { getAttribution } from "@/lib/attribution";

const RAZORPAY_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void; on: (e: string, cb: (r: unknown) => void) => void };
  }
}

interface Preview {
  firstName: string;
  mulank: { number: number; planet: string };
  bhagyank: { number: number; planet: string };
  name: { number: number; planet: string };
  traits: string[];
}

/** Inject the Razorpay Checkout script once, resolving when it's ready. */
function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function OrderForm({ initialLang: _initialLang = "en" }: { initialLang?: ReportLang }) {
  // Assamese report language is paused site-wide for now (Assam flood
  // relief in progress) — force English regardless of ?lang= in the URL.
  const router = useRouter();
  const searchParams = useSearchParams();

  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState<DobValue>({ day: "", month: "", year: "" });
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [paying, setPaying] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);

  const resultRef = useRef<HTMLDivElement>(null);
  // Scroll only when they pressed the button themselves. Arriving prefilled
  // from the calculator already lands on the numbers, so scrolling there would
  // yank the page for no reason.
  const scrollOnNextResult = useRef(false);

  /** The numbers render below the fold on a phone; without this the button looks dead. */
  useEffect(() => {
    if (!preview || !scrollOnNextResult.current) return;
    scrollOnNextResult.current = false;

    const el = resultRef.current;
    if (!el) return;

    const reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }, [preview]);

  /**
   * Ask the server for the free preview. Name + DOB only — no email, so the
   * customer sees their numbers before being asked for anything.
   */
  const fetchPreview = useCallback(
    async (name: string, d: DobValue) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: name,
            day: d.day,
            month: d.month,
            year: d.year,
            lang: "en",
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Something went wrong. Please check your details.");
          return false;
        }
        setPreview(data.preview as Preview);
        trackFreeResultViewed("order");
        return true;
      } catch {
        setError("Could not reach the server. Please try again.");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * Arriving from the free calculator: name and DOB ride along in the query so
   * nobody types them twice. Jump straight to their numbers.
   */
  const prefillDone = useRef(false);
  useEffect(() => {
    if (prefillDone.current) return;

    const name = searchParams.get("name")?.trim();
    const d = searchParams.get("d");
    const m = searchParams.get("m");
    const y = searchParams.get("y");
    if (!name || !d || !m || !y) return;

    prefillDone.current = true;
    const next = { day: d, month: m, year: y };
    setFullName(name);
    setDob(next);
    void fetchPreview(name, next);
  }, [searchParams, fetchPreview]);

  /**
   * Native share sheet on mobile — points at the calculator, which shows a
   * result with no email required and is the lowest-friction landing spot
   * for whoever the link reaches.
   */
  async function handleShare() {
    if (!preview) return;
    const shareText = `My Mulank is ${preview.mulank.number} and Bhagyank is ${preview.bhagyank.number} — find yours free on Mystic Digits ✨`;
    const shareUrl = `${window.location.origin}/calculator`;

    if (navigator.share) {
      try {
        await navigator.share({ title: "My Numerology Numbers", text: shareText, url: shareUrl });
      } catch {
        // User dismissed the share sheet — not an error.
      }
      return;
    }

    await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  }

  function resetToForm() {
    setPreview(null);
    setError(null);
    setPayError(null);
    setVerifyingPayment(false);
  }

  /** Leave the order flow for the terminal status page. `replace` drops /order
   * from history so Back can't return into the payment flow. On success the
   * order id rides along so the thank-you page can fire the purchase
   * conversion with a real transaction_id. */
  function finish(status: "success" | "failed", orderId?: string) {
    const order = status === "success" && orderId ? `&order=${encodeURIComponent(orderId)}` : "";
    router.replace(`/thank-you?status=${status}${order}`);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!dob.day || !dob.month || !dob.year) {
      setError("Please enter your full date of birth.");
      return;
    }
    scrollOnNextResult.current = true;
    await fetchPreview(fullName.trim(), dob);
  }

  async function onPay() {
    setPayError(null);

    // Email is collected here, at the point of purchase, where "where should we
    // send it?" is a question that answers itself.
    if (!EMAIL_RE.test(email.trim())) {
      setPayError("Please enter a valid email address so we know where to send your report.");
      return;
    }

    setPaying(true);
    trackBeginCheckout();

    const ready = await loadRazorpay();
    if (!ready || !window.Razorpay) {
      setPayError("Couldn't load the payment window. Check your connection and try again.");
      setPaying(false);
      return;
    }

    let data: {
      keyId: string;
      razorpayOrderId: string;
      amount: number;
      currency: string;
      prefill: { name: string; email: string };
    };
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Attribution rides along so the order row records where this
        // customer originally came from (UTM/gclid/fbclid/referrer).
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          day: dob.day,
          month: dob.month,
          year: dob.year,
          lang: "en",
          attribution: getAttribution(),
        }),
      });
      data = await res.json();
      if (!res.ok) {
        // Pre-payment failure (no charge attempted) — keep them here to retry.
        setPayError((data as unknown as { error?: string }).error ?? "Could not start checkout.");
        setPaying(false);
        return;
      }
    } catch {
      setPayError("Could not reach the server. Please try again.");
      setPaying(false);
      return;
    }

    const rzp = new window.Razorpay({
      key: data.keyId,
      order_id: data.razorpayOrderId,
      amount: data.amount,
      currency: data.currency,
      name: "Mystic Digits",
      description: "Personalised 10-page Numerology Report",
      prefill: data.prefill,
      theme: { color: "#c9a84c" },
      handler: async (response: unknown) => {
        // Payment succeeded at Razorpay; confirm the signature server-side.
        setVerifyingPayment(true);
        try {
          const vr = await fetch("/api/checkout/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          const vd = await vr.json();
          if (vr.ok && vd.ok) {
            finish("success", vd.orderId as string | undefined);
          } else {
            finish("failed");
          }
        } catch {
          finish("failed");
        }
      },
      modal: { ondismiss: () => setPaying(false) },
    });
    // A declined/failed payment is a terminal outcome → the status page.
    rzp.on("payment.failed", () => finish("failed"));
    rzp.open();
  }

  if (!preview) {
    return (
      <div className="form-card">
        <form onSubmit={onSubmit} noValidate>
          <div className="field">
            <label htmlFor="fullName">Full name</label>
            <input
              id="fullName"
              type="text"
              autoComplete="name"
              placeholder="Your name here"
              value={fullName}
              onChange={(e) => {
                trackCalculatorStarted("order");
                setFullName(e.target.value);
                setError(null);
              }}
            />
          </div>

          <DobFields
            idPrefix="order"
            value={dob}
            onChange={(next) => {
              trackCalculatorStarted("order");
              setDob((d) => ({ ...d, ...next }));
              setError(null);
            }}
          />

          {error && (
            <div className="field err" role="alert">
              {error}
            </div>
          )}

          <button type="submit" className="cta" disabled={loading}>
            {loading ? "Reading your numbers…" : "See My Numbers — Free"}
          </button>

          <p className="notice" style={{ marginTop: 12 }}>
            Free · no signup · we only ask for an email when you order the full report
          </p>
        </form>
      </div>
    );
  }

  return (
    <>
      <div ref={resultRef} className="form-card" style={{ scrollMarginTop: 16 }}>
        <div className="preview">
          <button type="button" className="edit-link" onClick={resetToForm}>
            ← Edit details
          </button>
          <div className="preview-label">{preview.firstName}, here is your core</div>
          <div className="nums">
            <div className="num-chip">
              <div className="n">{preview.mulank.number}</div>
              <div className="k">Mulank</div>
              <div className="planet">{preview.mulank.planet}</div>
            </div>
            <div className="num-chip">
              <div className="n">{preview.bhagyank.number}</div>
              <div className="k">Bhagyank</div>
              <div className="planet">{preview.bhagyank.planet}</div>
            </div>
            <div className="num-chip">
              <div className="n">{preview.name.number}</div>
              <div className="k">Name</div>
              <div className="planet">{preview.name.planet}</div>
            </div>
          </div>
          {preview.traits?.length > 0 && (
            <>
              <div className="preview-traits-label">A glimpse of your Mulank {preview.mulank.number}</div>
              <ul className="preview-traits">
                {preview.traits.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </>
          )}

          <button
            type="button"
            className="cta cta-ghost"
            style={{ marginTop: 18, width: "100%", justifyContent: "center" }}
            onClick={handleShare}
          >
            {shareCopied ? "Link Copied!" : "Share My Numbers"}
          </button>
        </div>
      </div>

      <ReportOffer where="order">
        <div className="field" style={{ marginTop: 6, textAlign: "left" }}>
          <label htmlFor="email">Email (where we&apos;ll send your report)</label>
          <input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setPayError(null);
            }}
          />
        </div>

        <button
          type="button"
          className="cta"
          style={{ marginTop: 6, width: "100%", justifyContent: "center" }}
          onClick={() => {
            trackPaidCtaClicked("order");
            void onPay();
          }}
          disabled={paying || verifyingPayment}
        >
          {(paying || verifyingPayment) && <span className="btn-spinner" aria-hidden="true" />}
          {verifyingPayment
            ? "Confirming payment..."
            : paying
              ? "Opening payment..."
              : `Get My Full Report · ${PRICE_LABEL}`}
        </button>

        {payError && (
          <div className="field err" role="alert" style={{ marginTop: 12 }}>
            {payError}
          </div>
        )}
      </ReportOffer>
    </>
  );
}
