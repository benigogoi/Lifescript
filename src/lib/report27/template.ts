/**
 * 27-page Mystic Digits report.
 *
 * The 10 approved pages are taken straight from buildReportHtml (same design,
 * same data, renumbered), and 17 new pages are built around them in the same
 * visual language. See scripts/render-report27.ts.
 */
import { buildReportHtml, staticContent, CSS, type ReportOptions, type ResolvedContent } from "../report-template";
import {
  calculateNumerology,
  reduceToSingleDigit,
  PLANET_BY_NUMBER,
  LO_SHU_LINES,
  activeLoShuLines,
  letterValue,
  type Digit,
} from "../numerology";
import {
  LUCKY,
  NUMBER_CORE,
  PLANET_SANSKRIT,
  REMEDIES,
  YEAR_CORE,
  LO_SHU_ARROWS,
  yearFavourability,
  type YearTier,
} from "../report-data";
import { MULANK_CONTENT } from "../mulank-content";
import { BHAGYANK_CONTENT } from "../bhagyank-content";
import {
  ADOPT_NOTES,
  ADOPT_STEPS,
  BODY_AREAS,
  COMPOUND,
  ENERGY_HABITS,
  METHOD_NOTE,
  MISSING_REMEDY,
  MONEY,
  PERSONAL_MONTH,
  REPEATED,
  REPEATED_CHANNEL,
  SIGNATURE_TIPS,
  SPELLING_RULES,
  TIER_CLASS,
  TIER_LABEL,
  TIER_TEXT,
  TONE_LABEL,
  WELCOME_SECTIONS,
} from "./data";
import {
  assessName,
  chaldeanTotal,
  missingFilledByName,
  nextMonths,
  personalYear,
  personalYearSum,
  reduceChain,
  suggestSpellings,
  VERDICT_LABEL,
  type NameAssessment,
} from "./calc";
import type { Report27Content } from "./content-engine";

const FONTS =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Marcellus&family=Jost:wght@300;400;500;600&display=swap";

const DIGITS: Digit[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

/** Page numbers in one place, so cross-references in the copy can't drift. */
const P = {
  cover: 1, welcome: 2, glance: 3, mulank: 4, mulank2: 5, bhagyank: 6, name: 7, together: 8,
  nameAlign: 9, nameFix: 10, loshu: 11, planes: 12, missing: 13, repeated: 14,
  career: 15, money: 16, love: 17, compat: 18, health: 19,
  year1: 20, year2: 21, pyear: 22, months: 23, lucky: 24, remedies: 25, actions: 26, thankyou: 27,
} as const;

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const pad = (n: number) => String(n).padStart(2, "0");
const list = (items: string[]) => items.map((i) => `<li>${i}</li>`).join("");
const listAnd = (items: (string | number)[]) =>
  items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
const capFirst = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// --- shared page chrome (mirrors report-template.ts) ------------------------

const PETAL_DEF = `<g id="petal"><path d="M100 12 C112 40 112 60 100 78 C88 60 88 40 100 12 Z"/></g>`;

function petals(steps: number): string {
  const out: string[] = [];
  for (let a = 0; a < 360; a += 360 / steps) out.push(`<use href="#petal" transform="rotate(${a} 100 100)"/>`);
  return out.join("");
}

function mandala(opacity: number, steps: number, rings: number[]): string {
  const circles = rings.map((r) => `<circle cx="100" cy="100" r="${r}"/>`).join("");
  return `<svg class="mandala" viewBox="0 0 200 200" style="opacity:${opacity}"><g fill="none" stroke="#C9A84C" stroke-width="0.5">${circles}${PETAL_DEF}${petals(steps)}</g></svg>`;
}

const STARS = `<div class="stars"></div>`;
const FRAME = `<div class="frame"></div>`;

function extractSection(html: string, id: string): string {
  const m = html.match(new RegExp(`<section class="page" id="${id}">[\\s\\S]*?</section>`));
  if (!m) throw new Error(`Approved page "${id}" not found in buildReportHtml output`);
  return m[0];
}

function renumber(section: string, page: number): string {
  return section.replace(/(<div class="page-foot"><span>[^<]*<\/span><span>)[^<]*(<\/span><\/div>)/, `$1${pad(page)}$2`);
}

const badge = (cls: string, label: string) => `<span class="badge ${cls}">${label}</span>`;

// --- the report ---------------------------------------------------------------

export function buildReport27Html(opts: ReportOptions, ai: Report27Content): string {
  const now = opts.preparedDate ?? new Date();
  const year1 = opts.year1 ?? now.getFullYear();
  const year2 = opts.year2 ?? year1 + 1;
  const r = calculateNumerology(opts);
  const { day, month, year, fullName, firstName } = r.input;
  const mulank = r.mulank.number;
  const bhagyank = r.bhagyank.number;
  const nameNum = r.nameNumber.number;
  const mPlanet = r.mulank.planet;
  const bPlanet = r.bhagyank.planet;
  const mc = MULANK_CONTENT[mulank];
  const bc = BHAGYANK_CONTENT[bhagyank];

  const full = assessName(fullName, mulank, bhagyank);
  const fills = missingFilledByName(r.loShu.missing, nameNum, full.single);
  const fillFor = (d: Digit) => fills.find((f) => f.digit === d);

  // Approved pages, with this report's AI paragraphs slotted in exactly as the
  // live engine does (right after each page's opening paragraph). The Mulank
  // page keeps only its static copy; its AI paragraph gets a page of its own.
  const base = staticContent(r, year1, year2);
  const lead = (paras: string[], combo: string) => [paras[0], combo, ...paras.slice(1)];
  const resolved: ResolvedContent = {
    ...base,
    bhagyank: { ...base.bhagyank, paras: lead(base.bhagyank.paras, ai.bhagyankCombo) },
    name: { ...base.name, paras: lead(base.name.paras, ai.nameCombo) },
    loshu: { ...base.loshu, combo: ai.loshuCombo },
    year1: { ...base.year1, paras: lead(base.year1.paras, ai.year1Combo) },
    year2: { ...base.year2, paras: lead(base.year2.paras, ai.year2Combo) },
    lucky: { combo: ai.luckyCombo },
    remedy: { combo: ai.remedyCombo },
    thankyou: { message: ai.thankyou },
  };
  const approved = buildReportHtml({ ...opts, year1, year2, preparedDate: now }, resolved);
  const approvedPage = (id: string, page: number) => renumber(extractSection(approved, id), page);

  const foot = (page: number) =>
    `<div class="page-foot"><span>Mystic Digits · ${esc(fullName)}</span><span>${pad(page)}</span></div>`;

  const shell = (id: string, kicker: string, title: string, inner: string, page: number, art = mandala(0.05, 8, [96, 60])) => `
<section class="page" id="${id}">
  ${STARS}${art}${FRAME}
  <div class="content-inner">
    <div class="section-kicker">${kicker}</div>
    <h2 class="section-title">${title}</h2>
    ${inner}
  </div>
  ${foot(page)}
</section>`;

  const circle = (n: number | string, extra = "") => `<div class="mini-circle ${extra}">${n}</div>`;

  // ---- welcome ----
  const welcome = shell(
    "welcome",
    "Before You Begin",
    "How to Read Your Report",
    `<div class="body-copy fit"><p class="lead">${esc(ai.welcome)}</p></div>
    <div class="info-grid">${WELCOME_SECTIONS.map(
      (s) => `<div class="info-card"><div class="ic-pages">${s.pages}</div><div class="ic-title">${s.title}</div><div class="ic-text">${s.text}</div></div>`,
    ).join("")}</div>
    <p class="method-note">${METHOD_NOTE}</p>`,
    P.welcome,
  );

  // ---- numbers at a glance ----
  const bSum = reduceToSingleDigit(day) + reduceToSingleDigit(month) + reduceToSingleDigit(year);
  const py1 = personalYear(day, month, year1);
  const py2 = personalYear(day, month, year2);
  const pySum = (y: number) => personalYearSum(day, month, y);
  const sumLine = (a: number, b: number, c: number, total: number, result: number) =>
    `${a} + ${b} + ${c} = ${total}${total > 9 ? ` → ${result}` : ""}`;

  const glanceRows = [
    { n: mulank, label: "Mulank · Birth Number", sub: `Ruled by ${mPlanet} — who you are`, calc: `Birth day ${reduceChain(day)}` },
    {
      n: bhagyank,
      label: "Bhagyank · Destiny Number",
      sub: `Ruled by ${bPlanet} — where life leads you`,
      calc: sumLine(reduceToSingleDigit(day), reduceToSingleDigit(month), reduceToSingleDigit(year), bSum, bhagyank),
    },
    { n: nameNum, label: `Name Number · “${esc(firstName)}”`, sub: `Ruled by ${r.nameNumber.planet} — how others see you`, calc: `Letters total ${reduceChain(chaldeanTotal(firstName))}` },
    {
      n: full.single,
      label: "Full-Name Number",
      sub: full.compound ? `Compound ${full.compound} · ${COMPOUND[full.compound].name}` : "A single-digit vibration",
      calc: `Letters total ${reduceChain(full.total)}`,
    },
    { n: py1, label: `Personal Year · ${year1}`, sub: YEAR_CORE[py1].theme, calc: sumLine(reduceToSingleDigit(day), reduceToSingleDigit(month), reduceToSingleDigit(year1), pySum(year1), py1) },
    { n: py2, label: `Personal Year · ${year2}`, sub: YEAR_CORE[py2].theme, calc: sumLine(reduceToSingleDigit(day), reduceToSingleDigit(month), reduceToSingleDigit(year2), pySum(year2), py2) },
  ];

  const once = DIGITS.filter((d) => r.loShu.counts[d] === 1);
  const missingLine = (d: Digit) => {
    const f = fillFor(d);
    return `${d} · ${PLANET_BY_NUMBER[d]}${f ? ` <span class="filled">— filled by your name</span>` : ""}`;
  };
  const glance = shell(
    "glance",
    "Your Numbers at a Glance",
    "Your Complete Chart",
    `<table class="glance">${glanceRows
      .map(
        (row) =>
          `<tr><td class="g-num">${row.n}</td><td><div class="g-label">${row.label}</div><div class="g-sub">${row.sub}</div></td><td class="g-calc">${row.calc}</td></tr>`,
      )
      .join("")}</table>
    <div class="panels">
      <div class="panel"><h4>Missing from Your Birth Date</h4><p class="panel-text">${r.loShu.missing.length ? r.loShu.missing.map(missingLine).join("<br/>") : "None — every number 1–9 is present"}</p></div>
      <div class="panel"><h4>Repeated in Your Birth Date</h4><p class="panel-text">${r.loShu.repeated.length ? r.loShu.repeated.map((d) => `${d} × ${r.loShu.counts[d]} · ${PLANET_BY_NUMBER[d]}`).join("<br/>") : `No repeats — present once: ${once.join(", ")}`}</p></div>
    </div>
    <p class="method-note">Your Lo Shu grid is built from the digits of your birth date alone, so a number can be missing from it even when your name carries that number — traditionally, the name then fills the gap. Every number reduces to a single digit, 1–9. Name numbers use Chaldean letter values: A I J Q Y = 1 · B K R = 2 · C G L S = 3 · D M T = 4 · E H N X = 5 · U V W = 6 · O Z = 7 · F P = 8.</p>`,
    P.glance,
  );

  // ---- Mulank in combination (the AI paragraph's own page) ----
  const mulankDepth = shell(
    "mulank2",
    "Mulank · In Your Chart",
    `Your ${mPlanet} in Combination`,
    `<div class="hero-row">
      <div class="hero-circle">${mulank}</div>
      <div class="hero-meta">
        <div class="rule-by">Read Together With</div>
        <div class="planet-name">Bhagyank ${bhagyank} · Name ${nameNum}</div>
        <div class="essence">${esc(mc.meaning)} — and how the rest of your chart shapes it.</div>
      </div>
    </div>
    <div class="gold-rule"></div>
    <div class="body-copy"><p class="lead">${esc(ai.mulankCombo)}</p></div>
    <div class="panels">
      <div class="panel"><h4>Mulank ${mulank} at Its Best</h4><ul>${list(mc.strengths)}</ul></div>
      <div class="panel"><h4>Watch For</h4><ul>${list(mc.weaknesses)}</ul></div>
    </div>`,
    P.mulank2,
    mandala(0.06, 8, [96, 70, 44]),
  );

  // ---- how your numbers work together ----
  const relRow = (a: Digit, aLabel: string, b: Digit, bLabel: string) => {
    const t: YearTier = yearFavourability(a, b);
    return `<div class="rel-row"><div class="rel-pair">${circle(a)}<span class="rel-plus">+</span>${circle(b)}</div><div class="rel-body"><div class="rel-title">${aLabel} &amp; ${bLabel} ${badge(TIER_CLASS[t], TIER_LABEL[t])}</div><div class="rel-text">${TIER_TEXT[t]}</div></div></div>`;
  };
  const together = shell(
    "together",
    "Your Numbers · In Combination",
    "How Your Numbers Work Together",
    `<div class="rel-list">
      ${relRow(mulank, "Mulank", bhagyank, "Bhagyank")}
      ${relRow(mulank, "Mulank", nameNum, "Name Number")}
      ${relRow(bhagyank, "Bhagyank", nameNum, "Name Number")}
    </div>
    <div class="gold-rule"></div>
    <div class="body-copy"><p class="lead">${esc(ai.together)}</p></div>`,
    P.together,
    mandala(0.06, 8, [96, 70, 44]),
  );

  // ---- is your name aligned? ----
  const letters = full.full
    .split("")
    .map((ch) =>
      ch === " "
        ? `<span class="letter space"></span>`
        : letterValue(ch)
          ? `<span class="letter"><b>${esc(ch.toUpperCase())}</b><i>${letterValue(ch)}</i></span>`
          : "",
    )
    .join("");
  const compoundCard = full.compound
    ? `<div class="panel compound"><h4>${full.compound} · ${COMPOUND[full.compound].name} ${badge(full.tone, TONE_LABEL[full.tone])}</h4><p class="panel-text">${COMPOUND[full.compound].meaning}</p></div>`
    : `<div class="panel compound"><h4>A Single-Digit Name</h4><p class="panel-text">Your letters total less than 10, so your name carries its single number directly, without a compound vibration.</p></div>`;
  const nameAlign = shell(
    "name-align",
    "Your Name · Full-Name Reading",
    "Is Your Name Aligned?",
    `<div class="letters">${letters}</div>
    <p class="name-sum">Letters total <strong>${full.total}</strong>${full.compound ? ` → compound <strong>${full.compound}</strong>` : ""} → name number <strong>${full.single}</strong> · ${PLANET_BY_NUMBER[full.single]}</p>
    ${compoundCard}
    <div class="checks">
      <div class="check"><div class="c-label">With Your Mulank ${mulank}</div>${badge(TIER_CLASS[full.withMulank], TIER_LABEL[full.withMulank])}</div>
      <div class="check"><div class="c-label">With Your Bhagyank ${bhagyank}</div>${badge(TIER_CLASS[full.withBhagyank], TIER_LABEL[full.withBhagyank])}</div>
      <div class="check"><div class="c-label">Compound Vibration</div>${badge(full.tone, TONE_LABEL[full.tone])}</div>
    </div>
    <div class="verdict ${full.verdict}">${VERDICT_LABEL[full.verdict]}</div>
    <div class="body-copy"><p class="lead">${esc(ai.nameVerdict)}</p></div>`,
    P.nameAlign,
  );

  // ---- spelling options ----
  const options = suggestSpellings(fullName, mulank, bhagyank, 3);
  const spellRow = (a: NameAssessment, current: boolean) =>
    `<tr class="${current ? "current" : ""}"><td><div class="s-name">${esc(a.full)}</div>${current ? `<div class="s-sub">Your name today</div>` : ""}</td><td class="s-num">${a.total}</td><td>${a.compound ? `<span class="s-num">${a.compound}</span><div class="s-sub">${COMPOUND[a.compound].name}</div>` : "—"}</td><td class="s-num">${a.single}</td><td>${badge(a.verdict, VERDICT_LABEL[a.verdict])}</td></tr>`;
  const spellTable = (rows: NameAssessment[]) => `<table class="spell-table">
      <tr><th>Spelling</th><th>Total</th><th>Compound</th><th>Number</th><th>Fit</th></tr>
      ${spellRow(full, true)}
      ${rows.map((o) => spellRow(o, false)).join("")}
    </table>`;

  // With spelling options: the options and how to adopt one. Without any, the
  // adoption advice would be filler — so the page teaches how to strengthen
  // the name as it is, from its own planet's day, colours and mantra.
  const namePlanet = PLANET_BY_NUMBER[full.single];
  const nameLucky = LUCKY[full.single];
  const nameRem = REMEDIES[full.single];
  const nameDay = nameLucky.days.split(" & ")[0];
  const nameFix = options.length
    ? shell(
        "name-fix",
        "Your Name · Spelling Options",
        full.verdict === "aligned" ? "Your Name Is Already Aligned" : "Spelling Options for Your Name",
        `<p class="page-intro">${
          full.verdict === "aligned"
            ? "Your name already works with your birth numbers, so no change is needed. If you ever want a variation — for a signature, a brand or a social handle — these spellings keep the same alignment."
            : "Small spelling changes to your first or middle name can shift your name's vibration without changing how it sounds — your surname stays exactly as it is. Each option below brings your name into alignment with your Mulank and Bhagyank. Using one is entirely optional."
        }</p>
    ${spellTable(options)}
    <div class="panel rules"><h4>How We Choose Spellings</h4><ul>${list(SPELLING_RULES)}</ul></div>
    <div class="panels">
      <div class="panel"><h4>How to Use a New Spelling</h4><ul>${list(ADOPT_STEPS)}</ul></div>
      <div class="panel"><h4>Keep in Mind</h4><ul>${list(ADOPT_NOTES)}</ul></div>
    </div>`,
        P.nameFix,
      )
    : shell(
        "name-fix",
        "Your Name · Strengthening",
        full.verdict === "aligned" ? "Your Name Is Already Aligned" : "Strengthen Your Name Without Changing It",
        `<p class="page-intro">${
          full.verdict === "aligned"
            ? "Your name already works with your birth numbers, so there is nothing to change. These simple practices keep its vibration strong."
            : "No small change to your first or middle name brings your name into full alignment, and your surname is never one to change — so you don't need to change anything. These simple practices strengthen your name exactly as it is."
        }</p>
    ${spellTable([])}
    <div class="name-planet">
      <div class="np-head"><span class="np-label">Your Name's Planet</span><span class="np-planet">${full.single} · ${PLANET_SANSKRIT[namePlanet]} · ${namePlanet}</span></div>
      <div class="np-grid">
        <div><div class="np-key">Its Day</div><div class="np-val">${nameLucky.days}</div></div>
        <div><div class="np-key">Its Colours</div><div class="np-val">${nameLucky.colors.map((c) => c.name).join(", ")}</div></div>
      </div>
      <div class="np-mantra"><span class="np-m">${nameRem.mantra}</span><span class="np-sub">${nameRem.mantraSub}</span></div>
    </div>
    <div class="panels">
      <div class="panel"><h4>Traditional Signature Tips</h4><ul>${list(SIGNATURE_TIPS)}</ul></div>
      <div class="panel"><h4>Use Your Name Well</h4><ul>${list([
        "One spelling everywhere — documents, email, social media",
        "Introduce yourself by your full first name",
        `Wear ${nameLucky.colors[0].name.toLowerCase()} on ${nameDay}s`,
        `Begin important work on a ${nameDay}`,
      ])}</ul></div>
    </div>`,
        P.nameFix,
      );

  // ---- the eight planes ----
  const completeIds = new Set(activeLoShuLines(r.loShu.counts).map((l) => l.id));
  const planeRows = LO_SHU_LINES.map((line) => {
    const arrow = LO_SHU_ARROWS[line.id];
    const done = completeIds.has(line.id);
    const missingDigits = line.digits.filter((d) => r.loShu.counts[d] === 0);
    const byName = !done && missingDigits.every((d) => fillFor(d));
    const status = done ? badge("hf", "Complete") : byName ? badge("fav", "Supported by your name") : badge("steady", "Forming");
    const text = done
      ? arrow.text
      : byName
        ? `Needs ${listAnd(missingDigits)} — which your name already brings (${missingDigits.map((d) => fillFor(d)!.by).join(", ")}), so this plane is supported even though your birth date doesn't complete it.`
        : `Needs ${listAnd(missingDigits)} to complete — a quality to build deliberately rather than one that comes automatically.`;
    return `<div class="plane ${done ? "complete" : "forming"}"><div class="p-digits">${line.digits.join(" ")}</div><div><div class="p-name">${arrow.name} ${status}</div><div class="p-text">${text}</div></div></div>`;
  }).join("");
  const planes = shell(
    "planes",
    "Lo Shu Grid · The Eight Planes",
    "The Lines Your Chart Draws",
    `<p class="page-intro">Your grid holds eight lines — three across, three down and two diagonals. A plane is complete when your birth date carries all three of its numbers.</p>
    <div class="planes-list">${planeRows}</div>
    <div class="body-copy"><p>${esc(ai.planes)}</p></div>`,
    P.planes,
  );

  // ---- missing numbers ----
  const missingCards = r.loShu.missing
    .map((d) => {
      const f = fillFor(d);
      const planet = PLANET_BY_NUMBER[d];
      const title = `Missing ${d} · ${planet}${f ? ` ${badge("hf", `Supplied by your ${f.by}`)}` : ""}`;
      const text = f
        ? `Your birth date doesn't carry ${d}, but your ${f.by} brings ${planet}'s energy into your life every time your name is written or spoken — traditionally, your name fills this gap.`
        : `${capFirst(NUMBER_CORE[d].missingNote.replace(/^\d+\s*—\s*/, ""))}.`;
      return `<div class="digit-card">${circle(d, f ? "" : "muted")}<div><div class="dc-title">${title}</div><div class="dc-text">${text}</div><div class="dc-remedy">${f ? "Extra support" : "Remedy"} · ${MISSING_REMEDY[d]}</div></div></div>`;
    })
    .join("");
  const missingPage = shell(
    "missing",
    "Lo Shu Grid · Missing Numbers",
    r.loShu.missing.length ? "The Numbers You're Missing" : "A Complete Grid",
    `<p class="page-intro">${r.loShu.missing.length ? "These are the numbers your birth date doesn't carry. Missing numbers aren't flaws — they're qualities that don't come automatically, so they're worth building on purpose. Where your name carries the number, it already helps fill the gap." : "Every number from 1 to 9 appears in your birth date — a rare, evenly spread chart."}</p>
    <div class="digit-list">${missingCards}</div>
    <div class="body-copy"><p>${esc(ai.missing)}</p></div>`,
    P.missing,
  );

  // ---- repeated numbers ----
  const repeatedCards = r.loShu.repeated
    .map((d) => {
      const times = r.loShu.counts[d];
      return `<div class="digit-card">${circle(String(d).repeat(Math.min(times, 4)), times > 1 ? "multi" : "")}<div><div class="dc-title">${d} appears ${times} times · ${PLANET_BY_NUMBER[d]}</div><div class="dc-text">${times >= 3 ? REPEATED[d].many : REPEATED[d].two}</div><div class="dc-remedy">${REPEATED_CHANNEL[d]}</div></div></div>`;
    })
    .join("");
  const repeatedPage = shell(
    "repeated",
    "Lo Shu Grid · Repeated Numbers",
    r.loShu.repeated.length ? "Where Your Energy Doubles" : "Balanced Intensity",
    `<p class="page-intro">${r.loShu.repeated.length ? "A number that appears more than once in your birth date turns up the volume on its quality — a gift when you steer it, a habit when you don't." : "No number repeats in your birth date — your energy is spread evenly, with no single quality dominating."}</p>
    <div class="digit-list">${repeatedCards}</div>
    ${once.length ? `<div class="chips-row"><span class="chips-label">Present once</span>${once.map((d) => `<span class="chip">${d} · ${PLANET_BY_NUMBER[d]}</span>`).join("")}</div>` : ""}
    <div class="body-copy"><p>${esc(ai.repeated)}</p></div>`,
    P.repeated,
  );

  // ---- your life ----
  const lifeIntro = `<p class="page-intro">Read through your Mulank ${mulank} (${mPlanet}) and your Bhagyank ${bhagyank} (${bPlanet}).</p>`;

  const career = shell(
    "career",
    "Your Life · Career & Work",
    "The Work You're Built For",
    `${lifeIntro}
    <div class="gold-rule"></div>
    <div class="body-copy"><p class="lead">${mc.careerDetail}</p><p>${esc(ai.career)}</p></div>
    <div class="panels">
      <div class="panel"><h4>Suits Your Mulank ${mulank}</h4><ul>${list(mc.careers)}</ul></div>
      <div class="panel"><h4>Where Bhagyank ${bhagyank} Leads</h4><ul>${list(bc.careers.slice(0, 4))}</ul></div>
    </div>`,
    P.career,
  );

  const money = shell(
    "money",
    "Your Life · Money & Wealth",
    "How Money Moves for You",
    `${lifeIntro}
    <div class="gold-rule"></div>
    <div class="body-copy"><p class="lead">${MONEY[mulank].para}</p><p>${esc(ai.money)}</p></div>
    <div class="panels">
      <div class="panel"><h4>Do More Of</h4><ul>${list(MONEY[mulank].do)}</ul></div>
      <div class="panel"><h4>Watch Out For</h4><ul>${list(MONEY[mulank].avoid)}</ul></div>
    </div>`,
    P.money,
  );

  const matchTier = (d: Digit): YearTier => (d === mulank ? "Highly Favourable" : yearFavourability(mulank, d));
  const matches = DIGITS.filter((d) => d !== mulank && ["Highly Favourable", "Favourable"].includes(matchTier(d)));
  const harder = DIGITS.filter((d) => d !== mulank && matchTier(d) === "Challenging");
  const love = shell(
    "love",
    "Your Life · Love & Relationships",
    "What You Need in Love",
    `${lifeIntro}
    <div class="gold-rule"></div>
    <div class="body-copy"><p class="lead">${mc.love}</p><p>${esc(ai.love)}</p></div>
    <div class="panels">
      <div class="panel"><h4>Natural Matches</h4><ul>${list(matches.slice(0, 4).map((d) => `Mulank ${d} · ${PLANET_BY_NUMBER[d]}`))}</ul></div>
      <div class="panel"><h4>Take More Understanding</h4><ul>${harder.length ? list(harder.slice(0, 4).map((d) => `Mulank ${d} · ${PLANET_BY_NUMBER[d]}`)) : "<li>No difficult pairings for your number</li>"}</ul></div>
    </div>`,
    P.love,
  );

  const compatCells = DIGITS.map((d) => {
    const t = matchTier(d);
    const you = d === mulank;
    return `<div class="compat-cell ${TIER_CLASS[t]}${you ? " you" : ""}"><div class="cc-num">${d}</div><div class="cc-planet">${PLANET_BY_NUMBER[d]}</div><div class="cc-tier">${you ? "Your number" : TIER_LABEL[t]}</div></div>`;
  }).join("");
  const compat = shell(
    "compat",
    "Your Life · Compatibility",
    "Who You Match With",
    `<p class="page-intro">How your Mulank ${mulank} gets on with every other Mulank. To find someone's Mulank, add the digits of the day they were born until one digit remains — someone born on the 23rd is 2 + 3 = 5.</p>
    <div class="compat-grid">${compatCells}</div>
    <div class="gold-rule"></div>
    <div class="body-copy"><p class="lead">${esc(ai.compatibility)}</p></div>`,
    P.compat,
    mandala(0.05, 12, [96, 70]),
  );

  const health = shell(
    "health",
    "Your Life · Health & Energy",
    "Caring for Your Energy",
    `${lifeIntro}
    <div class="gold-rule"></div>
    <div class="body-copy"><p class="lead">${mc.health}</p><p>${esc(ai.health)}</p></div>
    <div class="panels">
      <div class="panel"><h4>${mPlanet} Governs</h4><ul>${list(BODY_AREAS[mPlanet])}</ul></div>
      <div class="panel"><h4>${bPlanet === mPlanet ? "Daily Energy Habits" : `${bPlanet} Governs`}</h4><ul>${list(bPlanet === mPlanet ? ENERGY_HABITS : BODY_AREAS[bPlanet])}</ul></div>
    </div>
    <p class="disclaimer">General wellbeing guidance rooted in numerology tradition — not medical advice. Please consult a doctor for any health concern.</p>`,
    P.health,
  );

  // ---- personal year ----
  const yearCard = (y: number, py: Digit) =>
    `<div class="year-card">${circle(py, "big")}<div><div class="yc-label">Personal Year · ${y}</div><div class="yc-theme">${YEAR_CORE[py].theme}</div><div class="calc-line">${sumLine(reduceToSingleDigit(day), reduceToSingleDigit(month), reduceToSingleDigit(y), pySum(y), py)}</div></div></div>`;
  const pyear = shell(
    "pyear",
    "Your Time · Personal Year",
    "Your Own Year Cycle",
    `<p class="page-intro">The Universal Year on pages ${P.year1}–${P.year2} is shared by everyone. Your Personal Year is yours alone — birth day, birth month and the calendar year, each reduced and added.</p>
    <div class="year-cards">${yearCard(year1, py1)}${yearCard(year2, py2)}</div>
    <div class="gold-rule"></div>
    <div class="body-copy"><p class="lead">${esc(ai.personalYear)}</p></div>
    <div class="panels">
      <div class="panel"><h4>${year1} Opportunities</h4><ul>${list(YEAR_CORE[py1].opportunities.slice(0, 3))}</ul></div>
      <div class="panel"><h4>${year1} Take Care</h4><ul>${list(YEAR_CORE[py1].takeCare.slice(0, 3))}</ul></div>
    </div>`,
    P.pyear,
  );

  // ---- next three months ----
  const months = nextMonths(now, day, month);
  const monthCards = months
    .map((mo, i) => {
      const pm = PERSONAL_MONTH[mo.personalMonth];
      return `<div class="month-card"><div class="mc-left"><div class="mc-month">${mo.label}</div><div class="mc-num">${mo.personalMonth}</div><div class="mc-label">Personal Month</div></div><div class="mc-right"><div class="mc-theme">${esc(ai.months[i]?.theme ?? pm.theme)}</div><div class="mc-line">${pm.theme} · ${pm.line}</div><div class="mc-focus">${esc(ai.months[i]?.focus ?? "")}</div></div></div>`;
    })
    .join("");
  const monthsPage = shell(
    "months",
    "Your Time · The Months Ahead",
    "Your Next Three Months",
    `<p class="page-intro">Inside your Personal Year, each month carries its own number — your Personal Year plus the calendar month. Here is what the next three ask of you.</p>
    <div class="month-list">${monthCards}</div>`,
    P.months,
  );

  // ---- action plan ----
  const actionRows = ai.actions
    .slice(0, 5)
    .map((a, i) => `<div class="action">${circle(i + 1)}<div><div class="a-title">${esc(a.title)}</div><div class="a-detail">${esc(a.detail)}</div></div></div>`)
    .join("");
  const actions = shell(
    "actions",
    "Your Action Plan",
    "Five Steps, Starting Now",
    `<p class="page-intro">Drawn from everything in your report. Start with the first one this week.</p>
    <div class="action-list">${actionRows}</div>
    <p class="method-note">Revisit this plan at the start of each month, alongside your Personal Month on page ${P.months}.</p>`,
    P.actions,
    mandala(0.06, 8, [96, 70, 44]),
  );

  const pages = [
    approvedPage("cover", P.cover),
    welcome,
    glance,
    approvedPage("mulank", P.mulank),
    mulankDepth,
    approvedPage("bhagyank", P.bhagyank),
    approvedPage("namenum", P.name),
    together,
    nameAlign,
    nameFix,
    approvedPage("loshu", P.loshu),
    planes,
    missingPage,
    repeatedPage,
    career,
    money,
    love,
    compat,
    health,
    approvedPage("year1", P.year1),
    approvedPage("year2", P.year2),
    pyear,
    monthsPage,
    approvedPage("lucky", P.lucky),
    approvedPage("remedies", P.remedies),
    actions,
    approvedPage("thankyou", P.thankyou),
  ];

  const fitScript = approved.match(/<script>[\s\S]*?<\/script>/)?.[0] ?? "";

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Mystic Digits Report — ${esc(fullName)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="${FONTS}" rel="stylesheet" />
<style>${CSS}${EXTRA_CSS}</style>
</head>
<body>
${pages.join("\n")}
${fitScript}
</body>
</html>`;
}

const EXTRA_CSS = `
  @page { size: 794px 1123px; margin: 0; }
  @media print { .page { margin: 0 !important; break-after: page; } }
  .body-copy.fit { flex: 0 1 auto; margin-top:22px; }
  .panel.rules { margin-top:18px; }
  #name-fix .spell-table td { padding:10px 8px; }
  #name-fix .panel { padding:13px 16px; }
  #name-fix .panel li { margin-bottom:4px; }
  .filled { color:var(--gold); font-size:12.5px; }
  .name-planet { margin-top:18px; background:rgba(201,168,76,0.05); border:1px solid rgba(201,168,76,0.28); border-radius:4px; padding:16px 20px; }
  .np-head { display:flex; justify-content:space-between; align-items:baseline; gap:12px; flex-wrap:wrap; }
  .np-label { font-size:11px; letter-spacing:3px; text-transform:uppercase; color:var(--red); }
  .np-planet { font-family:'Cormorant Garamond', serif; font-feature-settings:'lnum' 1; font-size:24px; font-weight:600; color:var(--gold-bright); }
  .np-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-top:10px; }
  .np-key { font-size:10.5px; letter-spacing:2px; text-transform:uppercase; color:var(--muted); }
  .np-val { font-family:'Cormorant Garamond', serif; font-size:22px; color:var(--white); margin-top:2px; }
  .np-mantra { margin-top:12px; padding-top:12px; border-top:1px solid rgba(201,168,76,0.18); text-align:center; }
  .np-m { display:block; font-family:'Cormorant Garamond', serif; font-size:25px; color:var(--gold-bright); }
  .np-sub { display:block; font-size:13px; color:var(--muted); margin-top:3px; }
  .page-intro { font-size:15.5px; line-height:1.5; color:#BFBFD0; margin-top:16px; }
  .panel-text { font-size:14.5px; line-height:1.5; color:#CFCFDE; }
  .method-note { margin-top:auto; padding-top:14px; border-top:1px solid rgba(201,168,76,0.18); font-size:13px; line-height:1.55; color:var(--muted); }
  .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-top:20px; }
  .info-card { background:rgba(255,255,255,0.025); border:1px solid rgba(201,168,76,0.18); border-radius:4px; padding:14px 16px; }
  .info-card .ic-pages { font-size:10.5px; letter-spacing:2.5px; text-transform:uppercase; color:var(--red); }
  .info-card .ic-title { font-family:'Marcellus', serif; font-size:18px; color:var(--gold); margin:4px 0; }
  .info-card .ic-text { font-size:14px; line-height:1.45; color:#CFCFDE; }
  .glance { width:100%; border-collapse:collapse; margin-top:22px; }
  .glance td { padding:12px 8px; border-bottom:1px solid rgba(255,255,255,0.07); vertical-align:middle; }
  .glance .g-num { font-family:'Cormorant Garamond', serif; font-feature-settings:'lnum' 1, 'tnum' 1; font-size:38px; font-weight:600; color:var(--gold-bright); width:64px; text-align:center; }
  .glance .g-label { font-family:'Marcellus', serif; font-size:16.5px; color:var(--white); }
  .glance .g-sub { font-size:13px; color:var(--muted); margin-top:3px; }
  .glance .g-calc { font-size:13.5px; color:#BFBFD0; text-align:right; white-space:nowrap; font-feature-settings:'lnum' 1, 'tnum' 1; }
  .badge { display:inline-block; vertical-align:middle; padding:3px 11px; border-radius:20px; border:1px solid; font-family:'Marcellus', serif; font-size:12px; letter-spacing:0.3px; white-space:nowrap; }
  .badge.hf, .badge.fortunate, .badge.aligned { color:var(--gold-bright); border-color:rgba(230,199,102,0.5); background:rgba(230,199,102,0.08); }
  .badge.fav { color:var(--gold); border-color:rgba(201,168,76,0.4); background:rgba(201,168,76,0.06); }
  .badge.steady, .badge.neutral, .badge.partly { color:var(--muted); border-color:rgba(154,154,176,0.35); background:rgba(154,154,176,0.05); }
  .badge.challenging, .badge.caution, .badge.misaligned { color:var(--red); border-color:rgba(224,90,78,0.4); background:rgba(224,90,78,0.08); }
  .mini-circle { width:48px; height:48px; border-radius:50%; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-family:'Cormorant Garamond', serif; font-feature-settings:'lnum' 1, 'tnum' 1; font-size:25px; font-weight:600; color:var(--gold-bright); background:rgba(201,168,76,0.10); border:1px solid rgba(201,168,76,0.5); }
  .mini-circle.muted { color:rgba(224,90,78,0.85); border-color:rgba(224,90,78,0.4); background:rgba(224,90,78,0.05); }
  .mini-circle.multi { width:auto; min-width:48px; padding:0 12px; border-radius:24px; font-size:21px; letter-spacing:2px; }
  .mini-circle.big { width:78px; height:78px; font-size:42px; }
  .rel-list { margin-top:24px; }
  .rel-row { display:flex; align-items:center; gap:20px; padding:15px 0; border-bottom:1px solid rgba(255,255,255,0.07); }
  .rel-pair { display:flex; align-items:center; gap:8px; flex-shrink:0; }
  .rel-plus { color:var(--muted); font-size:15px; }
  .rel-title { font-family:'Marcellus', serif; font-size:16.5px; color:var(--white); margin-bottom:4px; }
  .rel-text { font-size:14px; color:#BFBFD0; line-height:1.45; }
  .letters { display:flex; flex-wrap:wrap; gap:6px 4px; margin-top:24px; }
  .letter { display:flex; flex-direction:column; align-items:center; min-width:27px; padding:5px 3px; border:1px solid rgba(201,168,76,0.22); border-radius:3px; background:rgba(255,255,255,0.02); }
  .letter b { font-family:'Marcellus', serif; font-size:15px; font-weight:400; color:var(--white); }
  .letter i { font-style:normal; font-size:12px; color:var(--gold); font-feature-settings:'lnum' 1; }
  .letter.space { border:none; background:none; min-width:10px; }
  .name-sum { font-size:15.5px; color:#CFCFDE; margin-top:14px; }
  .name-sum strong { font-family:'Cormorant Garamond', serif; font-feature-settings:'lnum' 1; font-size:24px; font-weight:600; color:var(--gold-bright); }
  .panel.compound { margin-top:16px; }
  .panel.compound h4 { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
  .checks { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-top:14px; }
  .check { text-align:center; background:rgba(255,255,255,0.025); border:1px solid rgba(201,168,76,0.16); border-radius:4px; padding:12px 8px; }
  .check .c-label { font-size:10.5px; letter-spacing:1.8px; text-transform:uppercase; color:var(--muted); margin-bottom:8px; }
  .verdict { margin-top:16px; text-align:center; padding:12px; border-radius:4px; border:1px solid; font-family:'Cormorant Garamond', serif; font-size:28px; font-weight:600; }
  .verdict.aligned { color:var(--gold-bright); border-color:rgba(230,199,102,0.5); background:rgba(230,199,102,0.07); }
  .verdict.partly { color:var(--gold); border-color:rgba(201,168,76,0.35); background:rgba(201,168,76,0.05); }
  .verdict.misaligned { color:var(--red); border-color:rgba(224,90,78,0.4); background:rgba(224,90,78,0.06); }
  .verdict + .body-copy { margin-top:16px; }
  .spell-table { width:100%; border-collapse:collapse; margin-top:22px; }
  .spell-table th { font-size:10.5px; letter-spacing:2px; text-transform:uppercase; font-weight:400; color:var(--muted); text-align:left; padding:8px; border-bottom:1px solid rgba(201,168,76,0.3); }
  .spell-table td { padding:13px 8px; border-bottom:1px solid rgba(255,255,255,0.07); vertical-align:middle; font-size:15px; color:#D5D5E2; }
  .spell-table tr.current td { background:rgba(255,255,255,0.025); }
  .spell-table .s-name { font-family:'Cormorant Garamond', serif; font-size:23px; font-weight:600; color:var(--white); line-height:1.1; }
  .spell-table .s-sub { font-size:11.5px; color:var(--muted); margin-top:3px; }
  .spell-table .s-num { font-family:'Cormorant Garamond', serif; font-feature-settings:'lnum' 1, 'tnum' 1; font-size:22px; font-weight:600; color:var(--gold-bright); }
  .planes-list { margin-top:14px; }
  .plane { display:flex; align-items:flex-start; gap:16px; padding:9px 0; border-bottom:1px solid rgba(255,255,255,0.06); }
  .plane .p-digits { font-family:'Cormorant Garamond', serif; font-feature-settings:'lnum' 1; font-size:20px; letter-spacing:3px; min-width:74px; color:var(--gold-bright); padding-top:1px; }
  .plane.forming .p-digits { color:rgba(154,154,176,0.55); }
  .plane .p-name { font-family:'Marcellus', serif; font-size:15px; color:var(--white); }
  .plane .p-text { font-size:13.5px; line-height:1.4; color:#BFBFD0; margin-top:3px; }
  .planes-list + .body-copy, .digit-list + .body-copy, .chips-row + .body-copy { margin-top:16px; }
  .digit-list { margin-top:14px; }
  .digit-card { display:flex; align-items:flex-start; gap:18px; padding:13px 0; border-bottom:1px solid rgba(255,255,255,0.06); }
  .digit-card .dc-title { font-family:'Marcellus', serif; font-size:16.5px; color:var(--white); }
  .digit-card .dc-text { font-size:14.5px; line-height:1.45; color:#CFCFDE; margin-top:3px; }
  .digit-card .dc-remedy { font-size:13.5px; line-height:1.45; color:var(--gold); margin-top:5px; }
  .chips-row { display:flex; align-items:center; flex-wrap:wrap; gap:8px; margin-top:16px; }
  .chips-label { font-size:10.5px; letter-spacing:2px; text-transform:uppercase; color:var(--muted); margin-right:4px; }
  .chip { font-size:13px; color:#CFCFDE; border:1px solid rgba(201,168,76,0.25); border-radius:20px; padding:3px 11px; }
  .compat-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-top:22px; }
  .compat-cell { text-align:center; padding:14px 8px; border:1px solid; border-radius:4px; }
  .compat-cell .cc-num { font-family:'Cormorant Garamond', serif; font-feature-settings:'lnum' 1; font-size:40px; font-weight:600; line-height:1; }
  .compat-cell .cc-planet { font-size:10px; letter-spacing:2px; text-transform:uppercase; color:var(--muted); margin:5px 0 7px; }
  .compat-cell .cc-tier { font-family:'Marcellus', serif; font-size:13px; }
  .compat-cell.hf { color:var(--gold-bright); border-color:rgba(230,199,102,0.45); background:rgba(230,199,102,0.07); }
  .compat-cell.fav { color:var(--gold); border-color:rgba(201,168,76,0.35); background:rgba(201,168,76,0.04); }
  .compat-cell.steady { color:var(--muted); border-color:rgba(154,154,176,0.3); }
  .compat-cell.challenging { color:var(--red); border-color:rgba(224,90,78,0.35); background:rgba(224,90,78,0.05); }
  .compat-cell.you { box-shadow:0 0 0 2px rgba(230,199,102,0.7) inset; }
  .disclaimer { font-size:12px; color:var(--muted); font-style:italic; margin-top:10px; }
  .year-cards { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-top:22px; }
  .year-card { display:flex; align-items:center; gap:16px; background:rgba(255,255,255,0.025); border:1px solid rgba(201,168,76,0.18); border-radius:4px; padding:16px; }
  .year-card .yc-label { font-size:10.5px; letter-spacing:2px; text-transform:uppercase; color:var(--muted); }
  .year-card .yc-theme { font-family:'Cormorant Garamond', serif; font-size:23px; font-weight:600; color:var(--white); line-height:1.15; margin:3px 0; }
  .calc-line { font-size:12.5px; color:var(--gold); font-feature-settings:'lnum' 1, 'tnum' 1; }
  .month-list { margin-top:10px; }
  .month-card { display:flex; gap:20px; margin-top:16px; background:rgba(255,255,255,0.025); border:1px solid rgba(201,168,76,0.18); border-radius:4px; padding:18px; }
  .month-card .mc-left { min-width:128px; text-align:center; border-right:1px solid rgba(201,168,76,0.2); padding-right:16px; }
  .mc-month { font-family:'Marcellus', serif; font-size:13px; letter-spacing:1.5px; text-transform:uppercase; color:var(--gold); }
  .mc-num { font-family:'Cormorant Garamond', serif; font-feature-settings:'lnum' 1; font-size:54px; font-weight:600; line-height:1.1; color:var(--gold-bright); }
  .mc-label { font-size:10px; letter-spacing:2px; text-transform:uppercase; color:var(--muted); }
  .mc-theme { font-family:'Cormorant Garamond', serif; font-size:25px; font-weight:600; color:var(--white); line-height:1.15; }
  .mc-line { font-size:13.5px; color:var(--gold); margin:4px 0 8px; }
  .mc-focus { font-size:15px; line-height:1.5; color:#CFCFDE; }
  .action-list { margin-top:12px; }
  .action { display:flex; align-items:flex-start; gap:18px; padding:16px 0; border-bottom:1px solid rgba(255,255,255,0.06); }
  .action .a-title { font-family:'Marcellus', serif; font-size:18.5px; color:var(--white); }
  .action .a-detail { font-size:15.5px; line-height:1.5; color:#CFCFDE; margin-top:4px; }
`;
