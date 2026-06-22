/**
 * Mystic Digits — report template.
 *
 * Turns a customer's birth details into the full 10-page report HTML,
 * ready to render to PDF with headless Chrome. Pulls numbers from the
 * numerology engine and copy/correspondences from the knowledge base.
 */
import {
  calculateNumerology,
  reduceToSingleDigit,
  PLANET_BY_NUMBER,
  LO_SHU_LAYOUT,
  type BirthInput,
  type Digit,
  type NumerologyResult,
} from "./numerology";
import { NUMBER_CORE, YEAR_CORE, LUCKY, REMEDIES } from "./report-data";
import { STARFIELD_DATA_URI } from "./starfield";

export interface ReportOptions extends BirthInput {
  /** Years shown in the two prediction pages. Defaults to current + next. */
  year1?: number;
  year2?: number;
  /** Date the report is "prepared". Defaults to now. */
  preparedDate?: Date;
}

/**
 * The narrative copy the report needs, resolved for one specific customer.
 * Either produced statically from the knowledge base (`staticContent`) or
 * generated per-customer by the Claude content engine. Deterministic facts
 * (planets, lucky elements, remedies, the Lo Shu grid) are NOT here — the
 * template computes those directly from the engine + knowledge base.
 *
 * Contract for `paras[0]`: it is a continuation clause, because the template
 * prefixes the customer's name. Mulank/Bhagyank/Name leads become
 * `"{Name}, {paras[0]}"` (so paras[0] starts lowercase, e.g. "your Mulank…").
 * Year leads become `"{Name}, {year} {paras[0]}"` (e.g. "is a number 1 year…").
 */
export interface YearContent {
  theme: string;
  essence: string;
  paras: [string, string, string];
  opportunities: string[];
  takeCare: string[];
}

export interface ResolvedContent {
  mulank: { essence: string; paras: string[]; strengths: string[]; growth: string[] };
  bhagyank: { essence: string; paras: string[]; favours: string[]; asks: string[] };
  name: { essence: string; paras: string[]; gives: string[]; useWisely: string[] };
  loshu: { strongPlanes: string[]; missingItems: string[]; missingTitle: string };
  year1: YearContent;
  year2: YearContent;
  thankyou: { message: string };
}

/** Build the report's narrative from the static knowledge base (no AI). */
export function staticContent(r: NumerologyResult, year1: number, year2: number): ResolvedContent {
  const mc = NUMBER_CORE[r.mulank.number];
  const bc = NUMBER_CORE[r.bhagyank.number];
  const nc = NUMBER_CORE[r.nameNumber.number];
  const y1 = YEAR_CORE[reduceToSingleDigit(year1)];
  const y2 = YEAR_CORE[reduceToSingleDigit(year2)];

  const strongPlanes = r.loShu.repeated.length
    ? r.loShu.repeated.map((d) => `Number ${d} (${PLANET_BY_NUMBER[d]}) appears ${r.loShu.counts[d]} times — strong ${PLANET_BY_NUMBER[d]} energy`)
    : (Object.keys(r.loShu.counts) as unknown as string[]).map(Number).filter((d) => r.loShu.counts[d as Digit] > 0).slice(0, 3).map((d) => `Number ${d} (${PLANET_BY_NUMBER[d as Digit]}) is present in your chart`);

  const missingItems = r.loShu.missing.length
    ? r.loShu.missing.map((d) => NUMBER_CORE[d].missingNote)
    : ["Your chart contains every number — a rare and balanced energy map."];

  const missingTitle = r.loShu.missing.length ? `Missing: ${r.loShu.missing.join(" · ")}` : "A Complete Grid";

  const mapYear = (y: (typeof YEAR_CORE)[Digit]): YearContent => ({
    theme: y.theme,
    essence: y.essence,
    paras: y.paras,
    opportunities: y.opportunities,
    takeCare: y.takeCare,
  });

  return {
    mulank: { essence: mc.mulankEssence, paras: mc.mulankParas, strengths: mc.strengths, growth: mc.growth },
    bhagyank: { essence: bc.bhagyankEssence, paras: bc.bhagyankParas, favours: bc.destinyFavours, asks: bc.destinyAsks },
    name: { essence: nc.nameEssence, paras: nc.nameParas, gives: nc.nameGives, useWisely: nc.nameUseWisely },
    loshu: { strongPlanes: strongPlanes.slice(0, 4), missingItems, missingTitle },
    year1: mapYear(y1),
    year2: mapYear(y2),
    thankyou: {
      message: `Thank you for letting us read your numbers. May your path be clear, your ${r.mulank.planet} shine bright, and the year ahead carry you toward everything you are meant to become.`,
    },
  };
}

/** The customer-facing download filename, e.g. "mysticdigits_report_ravi_kumar.pdf". */
export function reportFileName(fullName: string): string {
  const slug = fullName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return `mysticdigits_report_${slug}.pdf`;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fmtDate(d: number, m: number, y: number): string {
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

function fmtPrepared(date: Date): string {
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

// --- reusable SVG fragments -------------------------------------------------

const PETAL_DEF = `<g id="petal"><path d="M100 12 C112 40 112 60 100 78 C88 60 88 40 100 12 Z"/></g>`;

function petals(steps: number): string {
  const out: string[] = [];
  for (let a = 0; a < 360; a += 360 / steps) {
    out.push(`<use href="#petal" transform="rotate(${a} 100 100)"/>`);
  }
  return out.join("");
}

function mandala(opacity: number, steps: number, rings: number[]): string {
  const circles = rings.map((r) => `<circle cx="100" cy="100" r="${r}"/>`).join("");
  return `<svg class="mandala" viewBox="0 0 200 200" style="opacity:${opacity}"><g fill="none" stroke="#C9A84C" stroke-width="0.5">${circles}${petals(steps)}</g></svg>`;
}

const STARS = `<div class="stars"></div>`;
const FRAME = `<div class="frame"></div>`;

function corner(cls: string): string {
  return `<svg class="corner ${cls}" viewBox="0 0 100 100" fill="none" stroke="#C9A84C" stroke-width="1.2"><path d="M4 40 C4 16 16 4 40 4"/><path d="M4 22 C4 10 10 4 22 4"/><circle cx="40" cy="40" r="2.5" fill="#C9A84C" stroke="none"/></svg>`;
}
const CORNERS = corner("tl") + corner("tr") + corner("bl") + corner("br");

function list(items: string[]): string {
  return items.map((i) => `<li>${i}</li>`).join("");
}

/** Renders body paragraphs; the first gets the drop-cap "lead" treatment. */
function bodyParas(ps: string[]): string {
  return ps.map((p, i) => (i === 0 ? `<p class="lead">${p}</p>` : `<p>${p}</p>`)).join("");
}

function foot(name: string, page: string): string {
  return `<div class="page-foot"><span>Mystic Digits · ${esc(name)}</span><span>${page}</span></div>`;
}

// --- the template ----------------------------------------------------------

export function buildReportHtml(opts: ReportOptions, content?: ResolvedContent): string {
  const now = opts.preparedDate ?? new Date();
  const year1 = opts.year1 ?? now.getFullYear();
  const year2 = opts.year2 ?? year1 + 1;

  const r = calculateNumerology(opts);
  const fn = r.input.firstName;
  const fnE = esc(fn);
  const fullE = esc(r.input.fullName);

  const mulank = r.mulank.number;
  const bhagyank = r.bhagyank.number;
  const nameNum = r.nameNumber.number;
  const uy1 = reduceToSingleDigit(year1);
  const uy2 = reduceToSingleDigit(year2);

  const mc = NUMBER_CORE[mulank];
  const bc = NUMBER_CORE[bhagyank];
  const nc = NUMBER_CORE[nameNum];
  const lucky = LUCKY[mulank];
  const rem = REMEDIES[mulank];

  const c = content ?? staticContent(r, year1, year2);

  // ---- cover ----
  const cover = `
<section class="page" id="cover">
  ${STARS}
  <svg class="mandala" viewBox="0 0 200 200"><g fill="none" stroke="#C9A84C" stroke-width="0.5">
    <circle cx="100" cy="100" r="96"/><circle cx="100" cy="100" r="78"/><circle cx="100" cy="100" r="54"/><circle cx="100" cy="100" r="30"/>
    ${PETAL_DEF}${petals(12)}
    <g stroke-width="0.4"><line x1="100" y1="4" x2="100" y2="196"/><line x1="4" y1="100" x2="196" y2="100"/><line x1="29" y1="29" x2="171" y2="171"/><line x1="171" y1="29" x2="29" y2="171"/></g>
  </g></svg>
  ${FRAME}${CORNERS}
  <div class="cover-inner">
    <div class="wordmark">Mystic Digits</div>
    <div class="tagline">Your Story · Your Numbers · Your Life</div>
    <h1 class="cover-title">The Numerology<br/>of <span class="accent">${fnE}</span></h1>
    <div class="cover-name">${fullE}</div>
    <div class="cover-dob">${fmtDate(r.input.day, r.input.month, r.input.year)}</div>
    <div class="divider"><span class="line"></span><span class="dot"></span><span class="line"></span></div>
    <div class="keynums">
      <div class="keynum"><div class="circle">${mulank}</div><span class="label">Mulank</span><span class="planet">${r.mulank.planet}</span></div>
      <div class="keynum"><div class="circle">${bhagyank}</div><span class="label">Bhagyank</span><span class="planet">${r.bhagyank.planet}</span></div>
      <div class="keynum"><div class="circle">${nameNum}</div><span class="label">Name No.</span><span class="planet">${r.nameNumber.planet}</span></div>
    </div>
    <div class="cover-foot">mysticdigits.in &nbsp;·&nbsp; Prepared ${fmtPrepared(now)}</div>
  </div>
</section>`;

  // ---- a standard "number" content page (mulank / bhagyank / name) ----
  const numberPage = (
    id: string,
    kicker: string,
    title: string,
    num: Digit,
    planetSanskrit: string,
    essence: string,
    bodyParagraphs: string[],
    panelA: { h: string; items: string[] },
    panelB: { h: string; items: string[] },
    page: string,
    steps = 8,
  ) => `
<section class="page" id="${id}">
  ${STARS}${mandala(0.06, steps, [96, 70, 44])}${FRAME}
  <div class="content-inner">
    <div class="section-kicker">${kicker}</div>
    <h2 class="section-title">${title}</h2>
    <div class="hero-row">
      <div class="hero-circle">${num}</div>
      <div class="hero-meta">
        <div class="rule-by">Ruled by</div>
        <div class="planet-name">${planetSanskrit}</div>
        <div class="essence">${essence}</div>
      </div>
    </div>
    <div class="gold-rule"></div>
    <div class="body-copy">${bodyParas(bodyParagraphs)}</div>
    <div class="panels">
      <div class="panel"><h4>${panelA.h}</h4><ul>${list(panelA.items)}</ul></div>
      <div class="panel"><h4>${panelB.h}</h4><ul>${list(panelB.items)}</ul></div>
    </div>
  </div>
  ${foot(r.input.fullName, page)}
</section>`;

  const mulankPage = numberPage(
    "mulank", "Mulank · The Birth Number", `Born of ${r.mulank.planet === "Sun" ? "the Sun" : esc(mc.planetSanskrit.split(" · ")[0])}`,
    mulank, mc.planetSanskrit, c.mulank.essence,
    [`${fnE}, ${c.mulank.paras[0]}`, ...c.mulank.paras.slice(1)],
    { h: "Your Strengths", items: c.mulank.strengths }, { h: "Your Growth Edge", items: c.mulank.growth }, "02",
  );

  const bhagyankPage = numberPage(
    "bhagyank", "Bhagyank · The Destiny Number", `The Path of ${r.bhagyank.planet}`,
    bhagyank, bc.planetSanskrit, c.bhagyank.essence,
    [`${fnE}, ${c.bhagyank.paras[0]}`, ...c.bhagyank.paras.slice(1)],
    { h: "Where Destiny Favours You", items: c.bhagyank.favours }, { h: "What Destiny Asks of You", items: c.bhagyank.asks }, "03",
  );

  const namePage = numberPage(
    "namenum", "Name Number · The Sound You Carry", `The Name “${fnE}”`,
    nameNum, nc.planetSanskrit, c.name.essence,
    [`Your name “${fnE}” ${c.name.paras[0]}`, ...c.name.paras.slice(1)],
    { h: "Your Name Gives You", items: c.name.gives }, { h: "Use It Wisely", items: c.name.useWisely }, "05",
  );

  // ---- Lo Shu grid ----
  const cells = LO_SHU_LAYOUT.flat().map((digit) => {
    const count = r.loShu.counts[digit];
    const present = count > 0;
    const display = present ? String(digit).repeat(count) : String(digit);
    return `<div class="cell ${present ? "present" : "missing"}"><span class="num">${display}</span><span class="planet-tag">${PLANET_BY_NUMBER[digit]}</span></div>`;
  }).join("");

  const loshuPage = `
<section class="page" id="loshu">
  ${STARS}${FRAME}
  <div class="content-inner">
    <div class="section-kicker">Lo Shu Grid · Your Energy Map</div>
    <h2 class="section-title">The Numbers You Carry</h2>
    <div class="loshu-wrap">
      <div class="loshu">
        <svg class="loshu-geo" viewBox="0 0 200 200" fill="none" stroke="#C9A84C" stroke-width="0.5"><circle cx="100" cy="100" r="98"/><circle cx="100" cy="100" r="74"/><rect x="28" y="28" width="144" height="144"/><rect x="28" y="28" width="144" height="144" transform="rotate(45 100 100)"/>${petals(4)}</svg>
        <div class="loshu-grid">${cells}</div>
      </div>
    </div>
    <div class="legend">
      <span><i class="swatch" style="background:var(--gold-bright)"></i> Present in your chart</span>
      <span><i class="swatch" style="background:rgba(224,90,78,0.4)"></i> Missing number</span>
    </div>
    <div class="gold-rule"></div>
    <div class="panels">
      <div class="panel"><h4>Your Strong Planes</h4><ul>${list(c.loshu.strongPlanes.slice(0, 4))}</ul></div>
      <div class="panel"><h4>${c.loshu.missingTitle}</h4><ul>${list(c.loshu.missingItems)}</ul></div>
    </div>
  </div>
  ${foot(r.input.fullName, "04")}
</section>`;

  // ---- year prediction page ----
  const yearPage = (id: string, year: number, uy: Digit, yc: YearContent, page: string) => `
<section class="page" id="${id}">
  ${STARS}${mandala(0.06, 6, [96, 70])}${FRAME}
  <div class="content-inner">
    <div class="section-kicker">Your Year Ahead · ${year}</div>
    <h2 class="section-title">${yc.theme}</h2>
    <div class="hero-row">
      <div class="hero-circle">${uy}</div>
      <div class="hero-meta">
        <div class="rule-by">Personal Year</div>
        <div class="planet-name">Number ${uy} · ${PLANET_BY_NUMBER[uy]}</div>
        <div class="essence">${year} ${yc.essence}</div>
      </div>
    </div>
    <div class="gold-rule"></div>
    <div class="body-copy">${bodyParas([`${fnE}, ${year} ${yc.paras[0]}`, ...yc.paras.slice(1)])}</div>
    <div class="panels">
      <div class="panel"><h4>Opportunities</h4><ul>${list(yc.opportunities)}</ul></div>
      <div class="panel"><h4>Take Care</h4><ul>${list(yc.takeCare)}</ul></div>
    </div>
  </div>
  ${foot(r.input.fullName, page)}
</section>`;

  // ---- lucky elements ----
  const colorDots = lucky.colors.map((c) => `<i style="background:${c.hex}"></i>`).join("");
  const colorNames = lucky.colors.map((c) => c.name).join(", ");
  const luckyIcon = {
    sun: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="1.4"><circle cx="12" cy="12" r="4.5"/><g stroke-linecap="round"><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/><line x1="5" y1="5" x2="7" y2="7"/><line x1="17" y1="17" x2="19" y2="19"/><line x1="19" y1="5" x2="17" y2="7"/><line x1="7" y1="17" x2="5" y2="19"/></g></svg>`,
    palette: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="1.4"><path d="M12 3a9 9 0 100 18 3 3 0 003-3v-1a2 2 0 012-2h1a3 3 0 003-3 9 9 0 00-12-6z"/></svg>`,
    hash: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="1.4" stroke-linecap="round"><line x1="9" y1="4" x2="7" y2="20"/><line x1="17" y1="4" x2="15" y2="20"/><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/></svg>`,
    gem: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="1.4" stroke-linejoin="round"><path d="M6 3h12l4 6-10 12L2 9z"/><path d="M2 9h20M9 3l3 18M15 3l-3 18"/></svg>`,
    metal: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="1.4"><circle cx="12" cy="14" r="6"/><path d="M9 4h6M12 4v4" stroke-linecap="round"/></svg>`,
    compass: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="1.4" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7l3 5-3 5-3-5z"/></svg>`,
  };
  const luckyItem = (icon: string, label: string, value: string) =>
    `<div class="lucky-item"><div class="lucky-ic">${icon}</div><div><div class="l-label">${label}</div><div class="l-value">${value}</div></div></div>`;

  const luckyPage = `
<section class="page" id="lucky">
  ${STARS}${mandala(0.05, 8, [96, 60])}${FRAME}
  <div class="content-inner">
    <div class="section-kicker">Lucky Elements · Aligned to Your ${r.mulank.planet}</div>
    <h2 class="section-title">What Brings You Fortune</h2>
    <div class="lucky-grid">
      ${luckyItem(luckyIcon.sun, "Lucky Days", lucky.days)}
      ${luckyItem(luckyIcon.palette, "Lucky Colours", `${colorNames} <span class="color-dots">${colorDots}</span>`)}
      ${luckyItem(luckyIcon.hash, "Lucky Numbers", lucky.numbers)}
      ${luckyItem(luckyIcon.gem, "Gemstone", lucky.gemstone)}
      ${luckyItem(luckyIcon.metal, "Lucky Metal", lucky.metal)}
      ${luckyItem(luckyIcon.compass, "Favourable Direction", lucky.direction)}
    </div>
  </div>
  ${foot(r.input.fullName, "08")}
</section>`;

  // ---- remedies ----
  const remedyRows = rem.items.map((it, i) =>
    `<div class="remedy"><div class="r-no">${i + 1}</div><div><div class="r-title">${it.title}</div><div class="r-desc">${it.desc}</div></div></div>`
  ).join("");

  const remediesPage = `
<section class="page" id="remedies">
  ${STARS}${mandala(0.06, 8, [96, 70, 44])}${FRAME}
  <div class="content-inner">
    <div class="section-kicker">Vedic Remedies · Strengthen Your ${r.mulank.planet}</div>
    <h2 class="section-title">Simple Daily Practices</h2>
    <div class="mantra-box">
      <div class="m-label">Your Mantra</div>
      <div class="m-text">${rem.mantra}</div>
      <div class="m-sub">${rem.mantraSub}</div>
    </div>
    <div class="remedies">${remedyRows}</div>
  </div>
  ${foot(r.input.fullName, "09")}
</section>`;

  // ---- thank you + upsell ----
  const thankyouPage = `
<section class="page" id="thankyou">
  ${STARS}${mandala(0.09, 12, [96, 78, 54, 30])}${FRAME}${CORNERS}
  <div class="ty-inner">
    <div class="wordmark" style="font-size:18px">Mystic Digits</div>
    <div class="ty-namaste">Namaste, ${fnE}</div>
    <p class="ty-msg">${c.thankyou.message}</p>
  </div>
</section>`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Mystic Digits Report — ${fullE}</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Marcellus&family=Jost:wght@300;400;500;600&display=swap" rel="stylesheet" />
<style>${CSS}</style>
</head>
<body>
${cover}
${mulankPage}
${bhagyankPage}
${loshuPage}
${namePage}
${yearPage("year1", year1, uy1, c.year1, "06")}
${yearPage("year2", year2, uy2, c.year2, "07")}
${luckyPage}
${remediesPage}
${thankyouPage}
</body>
</html>`;
}

// --- styles (ported from the approved preview) ------------------------------

const CSS = `
  :root { --bg:#0D0D12; --bg-soft:#14141C; --gold:#C9A84C; --gold-bright:#E6C766; --white:#E8E8F0; --muted:#9A9AB0; --red:#E05A4E; }
  * { margin:0; padding:0; box-sizing:border-box; }
  html, body { background:#05050a; }
  .page { position:relative; width:794px; height:1123px; background:var(--bg); color:var(--white); overflow:hidden; font-family:'Jost', sans-serif; font-feature-settings:'lnum' 1, 'tnum' 1; margin:0 auto 40px; }
  /* Baked starfield: one image per page instead of ~180 gradient patterns
     (kept the PDF slow to render). Regenerate via scripts/gen-starfield.ts. */
  .stars { position:absolute; inset:0; pointer-events:none; background-image:url(${STARFIELD_DATA_URI}); background-size:100% 100%; background-repeat:no-repeat; }
  .mandala { position:absolute; left:50%; top:50%; width:720px; height:720px; transform:translate(-50%,-50%); opacity:0.10; pointer-events:none; }
  .corner { position:absolute; width:110px; height:110px; opacity:0.55; }
  .corner.tl { top:26px; left:26px; }
  .corner.tr { top:26px; right:26px; transform:scaleX(-1); }
  .corner.bl { bottom:26px; left:26px; transform:scaleY(-1); }
  .corner.br { bottom:26px; right:26px; transform:scale(-1,-1); }
  .frame { position:absolute; inset:40px; border:1px solid rgba(201,168,76,0.28); border-radius:2px; pointer-events:none; }
  .cover-inner { position:relative; z-index:2; height:100%; display:flex; flex-direction:column; align-items:center; text-align:center; padding:96px 70px 64px; }
  .wordmark { font-family:'Marcellus', serif; letter-spacing:7px; font-size:24px; color:var(--gold); text-transform:uppercase; }
  .tagline { font-size:11px; letter-spacing:4px; color:var(--muted); text-transform:uppercase; margin-top:12px; }
  .cover-title { font-family:'Cormorant Garamond', serif; font-weight:500; font-size:58px; line-height:1.05; margin-top:auto; color:var(--white); }
  .cover-title .accent { color:var(--gold-bright); font-style:italic; }
  .cover-name { font-family:'Cormorant Garamond', serif; font-size:40px; font-weight:600; letter-spacing:1px; margin-top:34px; color:var(--white); }
  .cover-dob { font-size:13px; letter-spacing:3px; color:var(--muted); margin-top:10px; text-transform:uppercase; }
  .divider { display:flex; align-items:center; gap:14px; margin:38px 0; width:60%; }
  .divider .line { flex:1; height:1px; background:linear-gradient(90deg, transparent, var(--gold), transparent); }
  .divider .dot { width:6px; height:6px; transform:rotate(45deg); background:var(--gold); }
  .keynums { display:flex; gap:46px; margin-top:4px; }
  .keynum { display:flex; flex-direction:column; align-items:center; gap:12px; }
  .circle { width:92px; height:92px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-family:'Cormorant Garamond', serif; font-feature-settings:'lnum' 1, 'tnum' 1; font-size:44px; font-weight:600; color:var(--gold-bright); background:rgba(201,168,76,0.10); border:1px solid rgba(201,168,76,0.55); }
  .keynum .label { font-size:10px; letter-spacing:3px; color:var(--muted); text-transform:uppercase; }
  .keynum .planet { font-size:11px; letter-spacing:1px; color:var(--gold); }
  .cover-foot { margin-top:auto; font-size:11px; letter-spacing:3px; color:var(--muted); text-transform:uppercase; }
  .content-inner { position:relative; z-index:2; height:100%; padding:92px 78px 80px; display:flex; flex-direction:column; }
  .content-inner > * { flex:0 0 auto; }
  .section-kicker { font-size:12px; letter-spacing:5px; color:var(--red); text-transform:uppercase; }
  .section-title { font-family:'Cormorant Garamond', serif; font-weight:600; font-size:46px; color:var(--white); margin-top:6px; line-height:1; }
  .hero-row { display:flex; align-items:center; gap:34px; margin:30px 0 12px; }
  .hero-circle { width:150px; height:150px; border-radius:50%; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-family:'Cormorant Garamond', serif; font-feature-settings:'lnum' 1, 'tnum' 1; font-size:84px; font-weight:600; color:var(--gold-bright); background:rgba(201,168,76,0.13); border:1.5px solid rgba(201,168,76,0.6); }
  .hero-meta .rule-by { font-size:13px; letter-spacing:3px; color:var(--muted); text-transform:uppercase; }
  .hero-meta .planet-name { font-family:'Cormorant Garamond', serif; font-size:38px; color:var(--gold); margin:4px 0 10px; }
  .hero-meta .essence { font-size:16.5px; color:var(--white); opacity:0.85; max-width:320px; line-height:1.4; }
  .gold-rule { height:1px; background:linear-gradient(90deg, var(--gold), transparent); margin:18px 0; }
  .body-copy { font-size:17.5px; line-height:1.55; color:#D5D5E2; flex:1 1 auto; min-height:0; overflow:hidden; }
  .body-copy p { margin-bottom:10px; }
  .body-copy .lead::first-letter { font-family:'Cormorant Garamond', serif; color:var(--gold-bright); font-size:54px; float:left; line-height:0.8; margin:6px 10px 0 0; }
  .panels { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-top:16px; }
  .panel { background:rgba(255,255,255,0.025); border:1px solid rgba(201,168,76,0.18); border-radius:4px; padding:16px 18px; }
  .panel h4 { font-family:'Marcellus', serif; font-size:17px; letter-spacing:1px; color:var(--gold); margin-bottom:9px; }
  .panel ul { list-style:none; }
  .panel li { font-size:15px; line-height:1.35; color:#CFCFDE; padding-left:18px; position:relative; margin-bottom:6px; }
  .panel li::before { content:""; position:absolute; left:2px; top:6px; width:6px; height:6px; background:var(--gold); transform:rotate(45deg); }
  .page-foot { position:absolute; left:78px; right:78px; bottom:40px; display:flex; justify-content:space-between; font-size:10px; letter-spacing:2px; color:var(--muted); text-transform:uppercase; }
  .loshu-wrap { display:flex; justify-content:center; margin:30px 0 8px; }
  .loshu { position:relative; width:348px; height:348px; }
  .loshu-geo { position:absolute; inset:-26px; opacity:0.14; }
  .loshu-grid { position:relative; width:100%; height:100%; display:grid; grid-template-columns:repeat(3,1fr); grid-template-rows:repeat(3,1fr); }
  .cell { border:1px solid rgba(201,168,76,0.30); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; }
  .cell .num { font-family:'Cormorant Garamond', serif; font-feature-settings:'lnum' 1; font-size:30px; letter-spacing:4px; }
  .cell.present .num { color:var(--gold-bright); text-shadow:0 0 14px rgba(201,168,76,0.45); }
  .cell.missing { background:rgba(224,90,78,0.04); }
  .cell.missing .num { color:rgba(154,154,176,0.35); }
  .cell .planet-tag { font-size:9px; letter-spacing:2px; text-transform:uppercase; color:var(--muted); }
  .cell.missing .planet-tag { color:rgba(224,90,78,0.6); }
  .legend { display:flex; justify-content:center; gap:40px; margin-top:22px; font-size:13px; color:var(--muted); }
  .legend span { display:inline-flex; align-items:center; gap:8px; }
  .swatch { width:12px; height:12px; border-radius:3px; display:inline-block; }
  .lucky-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-top:30px; }
  .lucky-item { display:flex; align-items:center; gap:16px; background:rgba(255,255,255,0.025); border:1px solid rgba(201,168,76,0.16); border-radius:4px; padding:16px 20px; }
  .lucky-ic { width:42px; height:42px; flex-shrink:0; border-radius:50%; border:1px solid rgba(201,168,76,0.4); display:flex; align-items:center; justify-content:center; color:var(--gold); font-size:18px; }
  .lucky-item .l-label { font-size:11px; letter-spacing:2px; text-transform:uppercase; color:var(--muted); }
  .lucky-item .l-value { font-family:'Cormorant Garamond', serif; font-size:24px; color:var(--white); margin-top:2px; }
  .color-dots { display:inline-flex; gap:6px; vertical-align:middle; margin-left:4px; }
  .color-dots i { width:14px; height:14px; border-radius:50%; display:inline-block; border:1px solid rgba(255,255,255,0.2); }
  .mantra-box { text-align:center; background:rgba(201,168,76,0.06); border:1px solid rgba(201,168,76,0.28); border-radius:4px; padding:24px; margin:28px 0; }
  .mantra-box .m-label { font-size:11px; letter-spacing:4px; text-transform:uppercase; color:var(--red); }
  .mantra-box .m-text { font-family:'Cormorant Garamond', serif; font-size:27px; color:var(--gold-bright); margin:10px 0 6px; }
  .mantra-box .m-sub { font-size:14px; color:var(--muted); letter-spacing:1px; }
  .remedy { display:flex; gap:18px; padding:14px 0; border-bottom:1px solid rgba(255,255,255,0.06); }
  .remedy:last-child { border-bottom:none; }
  .remedy .r-no { font-family:'Cormorant Garamond', serif; font-feature-settings:'lnum' 1; font-size:26px; color:var(--gold); min-width:30px; }
  .remedy .r-title { font-family:'Marcellus', serif; font-size:17px; color:var(--white); letter-spacing:0.5px; }
  .remedy .r-desc { font-size:15px; color:#BFBFD0; line-height:1.45; margin-top:3px; }
  .ty-inner { position:relative; z-index:2; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:110px 80px 70px; }
  .ty-namaste { font-family:'Cormorant Garamond', serif; font-size:30px; color:var(--gold); }
  .ty-msg { font-size:18px; line-height:1.6; color:#D5D5E2; max-width:460px; margin-top:18px; }
`;
