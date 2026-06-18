"use client";

import { useState } from "react";
import { PRICE_INR } from "@/lib/order";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface Preview {
  firstName: string;
  mulank: { number: number; planet: string };
  bhagyank: { number: number; planet: string };
  name: { number: number; planet: string };
}

export default function OrderForm() {
  const [form, setForm] = useState({ fullName: "", email: "", day: "", month: "", year: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<Preview | null>(null);

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setPreview(null);
    setError(null);
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

      {preview && (
        <div className="preview">
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
          <button type="button" className="cta" disabled style={{ marginTop: 18 }}>
            Get Full Report · ₹{PRICE_INR}
          </button>
          <div className="notice">
            Secure payment is being connected — you&apos;ll be able to complete your order here
            shortly.
          </div>
        </div>
      )}
    </div>
  );
}
