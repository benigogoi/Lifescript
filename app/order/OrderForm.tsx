"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PRICE_INR } from "@/lib/order";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

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

export default function OrderForm() {
  const router = useRouter();
  const [form, setForm] = useState({ fullName: "", email: "", day: "", month: "", year: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [paying, setPaying] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setPreview(null);
    setError(null);
    setPayError(null);
    setVerifyingPayment(false);
  }

  /** Leave the order flow for the terminal status page. `replace` drops /order
   * from history so Back can't return into the payment flow. */
  function finish(status: "success" | "failed") {
    router.replace(`/thank-you?status=${status}`);
  }

  async function onPay() {
    setPayError(null);
    setPaying(true);

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
        body: JSON.stringify(form),
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
      name: "LifeScript",
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
          finish(vr.ok && vd.ok ? "success" : "failed");
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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please check your details.");
        return;
      }
      setPreview(data.preview as Preview);
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-card">
      {!preview ? (
        <form onSubmit={onSubmit} noValidate>
          <div className="field">
            <label htmlFor="fullName">Full name</label>
            <input
              id="fullName"
              type="text"
              autoComplete="name"
              placeholder="e.g. Ravi Kumar"
              value={form.fullName}
              onChange={(e) => update("fullName", e.target.value)}
            />
          </div>

          <div className="field">
            <label>Date of birth</label>
            <div className="dob-row">
              <input
                type="number"
                inputMode="numeric"
                placeholder="DD"
                min={1}
                max={31}
                value={form.day}
                onChange={(e) => update("day", e.target.value)}
                aria-label="Day"
              />
              <select value={form.month} onChange={(e) => update("month", e.target.value)} aria-label="Month">
                <option value="">Month</option>
                {MONTHS.map((m, i) => (
                  <option key={m} value={i + 1}>
                    {m}
                  </option>
                ))}
              </select>
              <input
                type="number"
                inputMode="numeric"
                placeholder="YYYY"
                value={form.year}
                onChange={(e) => update("year", e.target.value)}
                aria-label="Year"
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="email">Email (where we'll send the report)</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
          </div>

          {error && <div className="field err" role="alert">{error}</div>}

          <button type="submit" className="cta" disabled={loading}>
            {loading ? "Reading your numbers…" : "See My Core Numbers — Free"}
          </button>
        </form>
      ) : (
        <div className="preview">
          <button type="button" className="edit-link" onClick={() => setPreview(null)}>
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
          <p className="sub" style={{ fontSize: 13 }}>
            Your full 10-page report reads all of these together — strengths, the years ahead, your
            Lo Shu grid, lucky elements and Vedic remedies.
          </p>
          <button
            type="button"
            className="cta"
            style={{ marginTop: 18 }}
            onClick={onPay}
            disabled={paying || verifyingPayment}
          >
            {(paying || verifyingPayment) && <span className="btn-spinner" aria-hidden="true" />}
            {verifyingPayment
              ? "Confirming payment..."
              : paying
                ? "Opening payment..."
                : `Get Full Report · ₹${PRICE_INR}`}
          </button>
          {payError && (
            <div className="field err" role="alert" style={{ marginTop: 12 }}>
              {payError}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
