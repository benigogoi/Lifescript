"use client";

import { useState } from "react";
import Link from "next/link";
import { reduceToSingleDigit } from "@/lib/numerology";
import { MULANK_CONTENT, type MulankNumber } from "@/lib/mulank-content";
import { DobFields, type DobValue } from "@/components/DobFields";
import { ReportOffer } from "@/components/ReportOffer";
import { PRICE_LABEL } from "@/lib/pricing";
import {
  trackCalculatorStarted,
  trackFreeResultViewed,
  trackPaidCtaClicked,
} from "@/lib/analytics";

/**
 * Free Mulank & Bhagyank calculator — the top of the funnel.
 *
 * Fully client-side: no API call, no signup, no email, no storage. The visitor
 * gets something genuinely useful before being asked for anything, and only
 * then sees the paid report. Calculation rules mirror src/lib/numerology.ts:
 *   • Mulank   — birth DAY reduced to a single digit (e.g. 28 -> 1)
 *   • Bhagyank — every digit of the full DOB summed, then reduced
 */

interface Result {
  mulank: MulankNumber;
  bhagyank: MulankNumber;
  day: number;
  month: number;
  year: number;
}

/** Sum every digit of the full DOB and reduce — the Bhagyank (destiny number). */
function bhagyankOf(day: number, month: number, year: number): MulankNumber {
  const allDigits = `${day}${month}${year}`
    .split("")
    .reduce((sum, ch) => sum + Number(ch), 0);
  return reduceToSingleDigit(allDigits) as MulankNumber;
}

/** A real calendar-date check, so 31 February can't produce a reading. */
function isRealDate(day: number, month: number, year: number): boolean {
  const d = new Date(year, month - 1, day);
  return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day;
}

export default function CalculatorForm() {
  const [name, setName] = useState("");
  const [dob, setDob] = useState<DobValue>({ day: "", month: "", year: "" });
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [shareCopied, setShareCopied] = useState(false);

  /** Any first keystroke counts as starting — the event itself fires once. */
  function markStarted() {
    trackCalculatorStarted("calculator");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    const day = Number(dob.day);
    const month = Number(dob.month);
    const year = Number(dob.year);

    if (!day || !month || !year) {
      setError("Please enter your full date of birth.");
      return;
    }
    if (year < 1900 || year > new Date().getFullYear()) {
      setError("Please check the year of birth.");
      return;
    }
    if (!isRealDate(day, month, year)) {
      setError("That date of birth isn't a real date.");
      return;
    }

    setResult({
      mulank: reduceToSingleDigit(day) as MulankNumber,
      bhagyank: bhagyankOf(day, month, year),
      day,
      month,
      year,
    });
    trackFreeResultViewed("calculator");
  }

  const firstName = name.trim().split(/\s+/)[0] ?? "";

  /**
   * Carry the name and DOB across so the customer never types them twice.
   * /order reads these and jumps straight to their numbers.
   */
  const orderHref = result
    ? `/order?name=${encodeURIComponent(name.trim())}&d=${result.day}&m=${result.month}&y=${result.year}`
    : "/order";

  /**
   * Web Share API on mobile (the vast majority of this traffic) opens the
   * native share sheet straight to WhatsApp/Instagram/etc — the calculator's
   * best organic distribution loop, since a result is inherently personal
   * and shareable. Desktop/unsupported browsers fall back to clipboard.
   */
  async function handleShare() {
    if (!result) return;
    const shareText = `My Mulank is ${result.mulank} and Bhagyank is ${result.bhagyank} — find yours free on Mystic Digits ✨`;
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
            onChange={(e) => {
              markStarted();
              setName(e.target.value);
            }}
          />
        </div>

        <DobFields
          idPrefix="calc"
          value={dob}
          onChange={(next) => {
            markStarted();
            setDob((d) => ({ ...d, ...next }));
          }}
        />

        {error && (
          <div className="field err" role="alert">
            {error}
          </div>
        )}

        <button type="submit" className="cta">
          Calculate My Numbers
        </button>

        <p className="notice" style={{ marginTop: 12 }}>
          Free · no signup · no email needed
        </p>
      </form>

      {result && (
        <>
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

              <button
                type="button"
                className="cta cta-ghost"
                style={{ marginTop: 20, width: "100%", justifyContent: "center" }}
                onClick={handleShare}
              >
                {shareCopied ? "Link Copied!" : "Share My Numbers"}
              </button>

              <p style={{ marginTop: 14, fontSize: 13 }}>
                <Link href={`/mulank/${result.mulank}`} style={{ color: "var(--gold)" }}>
                  Read more about Mulank {result.mulank} →
                </Link>
                {"  ·  "}
                <Link href={`/bhagyank/${result.bhagyank}`} style={{ color: "var(--gold)" }}>
                  Read more about Bhagyank {result.bhagyank} →
                </Link>
              </p>
            </div>
          </div>

          <ReportOffer where="calculator">
            <Link
              href={orderHref}
              className="cta"
              style={{ marginTop: 6, width: "100%", justifyContent: "center" }}
              onClick={() => trackPaidCtaClicked("calculator")}
            >
              Get My Full Report — {PRICE_LABEL}
            </Link>
          </ReportOffer>
        </>
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
