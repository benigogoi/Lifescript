"use client";

/**
 * Day / Month / Year birth-date input, shared by the free calculator and the
 * order form so the two can never drift apart.
 *
 * Deliberately three fields rather than <input type="date">: a native date
 * picker opens on today's date, so entering a 1967 birthday means scrolling
 * back six hundred months on a phone. Three fields is two taps and some digits.
 * `inputMode="numeric"` keeps the numeric keypad on mobile.
 */

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

export interface DobValue {
  day: string;
  month: string;
  year: string;
}

export function DobFields({
  value,
  onChange,
  idPrefix = "dob",
}: {
  value: DobValue;
  onChange: (next: Partial<DobValue>) => void;
  idPrefix?: string;
}) {
  return (
    <div className="field">
      <label htmlFor={`${idPrefix}-day`}>Date of birth</label>
      <div className="dob-row">
        <input
          id={`${idPrefix}-day`}
          type="number"
          inputMode="numeric"
          placeholder="DD"
          min={1}
          max={31}
          value={value.day}
          onChange={(e) => onChange({ day: e.target.value })}
          aria-label="Day of birth"
        />
        <select
          value={value.month}
          onChange={(e) => onChange({ month: e.target.value })}
          aria-label="Month of birth"
        >
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
          value={value.year}
          onChange={(e) => onChange({ year: e.target.value })}
          aria-label="Year of birth"
        />
      </div>
    </div>
  );
}
