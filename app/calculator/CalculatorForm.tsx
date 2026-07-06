"use client";

import { useState } from "react";
import Link from "next/link";
import { reduceToSingleDigit } from "@/lib/numerology";
import { MULANK_CONTENT, type MulankNumber } from "@/lib/mulank-content";

/**
 * Free Mulank & Bhagyank calculator. Fully client-side — no API calls, no
 * login, no storage. Calculation rules mirror src/lib/numerology.ts:
 *   • Mulank  — birth DAY reduced to a single digit (e.g. 28 -> 1)
 *   • Bhagyank — every digit of the full DOB summed, then reduced
 */

interface Result {
  mulank: MulankNumber;
  bhagyank: MulankNumber;
}

/** Parse the YYYY-MM-DD value a native date input produces. */
function parseDob(value: string): { day: number; month: number; year: number } | null {
  const parts = value.trim().split("-").map(Number);
  if (parts.length !== 3) return null;

  const [year, month, day] = parts;
  if (![day, month, year].every(Number.isInteger)) return null;
  if (day < 1 || day > 31) return null;
  if (month < 1 || month > 12) return null;
  if (year < 1900 || year > 2100) return null;

  return { day, month, year };
}

/** Sum every digit of the full DOB and reduce — the Bhagyank (destiny number). */
function bhagyankOf(day: number, month: number, year: number): MulankNumber {
  const allDigits = `${day}${month}${year}`
    .split("")
    .reduce((sum, ch) => sum + Number(ch), 0);
  return reduceToSingleDigit(allDigits) as MulankNumber;
}

export default function CalculatorForm() {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    const parsed = parseDob(dob);
    if (!parsed) {
      setError("Please select your date of birth.");
      return;
    }

    const mulank = reduceToSingleDigit(parsed.day) as MulankNumber;
    const bhagyank = bhagyankOf(parsed.day, parsed.month, parsed.year);
    setResult({ mulank, bhagyank });
  }

  const firstName = name.trim().split(/\s+/)[0] ?? "";

  return (
    <>
      <form className="form-card" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="calc-name">Full Name</label>
          <input
            id="calc-name"
            type="text"
            autoComplete="name"
            placeholder="e.g. Priya Sharma"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="calc-dob">Date of Birth</label>
          <input
            id="calc-dob"
            type="date"
            autoComplete="bday"
            min="1900-01-01"
            max={new Date().toISOString().slice(0, 10)}
            value={dob}
            onChange={(e) => setDob(e.target.value)}
          />
          {error && <div className="err">{error}</div>}
        </div>

        <button type="submit" className="cta">
          Calculate My Numbers
        </button>
      </form>

      {result && (
        <div className="form-card" style={{ marginTop: 22 }}>
          <div className="preview" style={{ marginTop: 0, paddingTop: 0, borderTop: "none" }}>
            <div className="preview-label">
              {firstName ? `${firstName}, your core numbers` : "Your core numbers"}
            </div>

            <div className="nums">
              {([
                { key: "Mulank", info: MULANK_CONTENT[result.mulank] },
                { key: "Bhagyank", info: MULANK_CONTENT[result.bhagyank] },
              ] as const).map(({ key, info }) => (
                <div className="num-chip" key={key}>
                  <div className="n">{info.number}</div>
                  <div className="k">{key}</div>
                  <div className="planet">{info.planet}</div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: "left", maxWidth: 460, margin: "18px auto 0" }}>
              <ResultLine label="Mulank" />
              <ResultRow info={MULANK_CONTENT[result.mulank]} />
              <div style={{ height: 18 }} />
              <ResultLine label="Bhagyank" />
              <ResultRow info={MULANK_CONTENT[result.bhagyank]} />
            </div>

            <p className="notice" style={{ marginTop: 22 }}>
              This is a free snapshot. Your full 10-page report adds your Lo Shu grid, Name Number,
              the year ahead, lucky elements, and personal Vedic remedies.
            </p>

            <Link href="/order" className="cta" style={{ marginTop: 18, width: "100%", justifyContent: "center" }}>
              Get Your Full 10-Page Vedic Report — ₹99
            </Link>

            <p style={{ marginTop: 14, fontSize: 13 }}>
              <Link href={`/mulank/${result.mulank}`} style={{ color: "var(--gold)" }}>
                Read more about Mulank {result.mulank} →
              </Link>
            </p>
          </div>
        </div>
      )}
    </>
  );
}

function ResultLine({ label }: { label: string }) {
  return (
    <div
      style={{
        fontFamily: "var(--font-label)",
        fontSize: 12,
        letterSpacing: 2,
        textTransform: "uppercase",
        color: "var(--gold)",
        marginBottom: 6,
      }}
    >
      {label}
    </div>
  );
}

function ResultRow({ info }: { info: (typeof MULANK_CONTENT)[MulankNumber] }) {
  return (
    <div style={{ color: "var(--white)", fontSize: 15, lineHeight: 1.7 }}>
      <strong style={{ color: "var(--gold-bright)" }}>
        {info.number} — {info.meaning}.
      </strong>
      <div style={{ color: "var(--muted)", fontSize: 14, marginTop: 4 }}>
        Ruling planet: <span style={{ color: "var(--white)" }}>{info.planet}</span> · Lucky colour:{" "}
        <span style={{ color: "var(--white)" }}>{info.luckyColor}</span>
      </div>
    </div>
  );
}
