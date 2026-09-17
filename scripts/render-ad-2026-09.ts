/**
 * Meta ad creatives for the 27-page / ₹249 relaunch (1080×1350, 4:5).
 *
 * Three ads, one idea each — never two pain points in one image:
 *   A "product"  — the report as an object you want to own (page fan, no hook)
 *   B "money"    — money-stress hook  (kamai hai, bachat nahi)
 *   C "effort"   — effort-not-rewarded hook (mehnat puri, result aadha)
 *
 * Deliberately NOT birth-day-targeted: the paused Mulank-4 creative spoke to
 * ~11.8% of the people who saw it. These speak to everyone.
 *
 *   CHROME_PATH="C:/Program Files/Google/Chrome/Application/chrome.exe" npx tsx scripts/render-ad-2026-09.ts
 *
 * In:  public/samples/sample27-*.webp, report/out/cover.png
 * Out: meta posts/ad-2026-09-{product,money,effort}-4x5.png
 */
import puppeteer from "puppeteer";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { STARFIELD_DATA_URI } from "../src/lib/starfield";

const ROOT = path.resolve(__dirname, "..");
const SYSTEM_CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const OUT_DIR = path.join(ROOT, "meta posts");

function dataUri(rel: string): string {
  const p = path.join(ROOT, rel);
  if (!existsSync(p)) throw new Error(`Missing asset: ${p}`);
  const mime = p.endsWith(".webp") ? "image/webp" : "image/png";
  return `data:${mime};base64,${readFileSync(p).toString("base64")}`;
}

const spark = (x: number, y: number, s: number, o: number) => `
<svg style="position:absolute;left:${x}px;top:${y}px;width:${s}px;height:${s}px;opacity:${o}"
  viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
  <path d="M20 0 C21.5 12 24 17 40 20 C24 23 21.5 28 20 40 C18.5 28 16 23 0 20 C16 17 18.5 12 20 0 Z" fill="#E6C766"/>
</svg>`;

/** Shared chrome: starfield, nebulae, gold hairline frame, wordmark, vignette. */
const SHELL_CSS = `
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-feature-settings:'lnum' 1,'tnum' 1; }
  .canvas { position:relative; width:1080px; height:1350px; overflow:hidden; background:#0D0D12;
    font-feature-settings:'lnum' 1,'tnum' 1; }
  .stars { position:absolute; inset:0; background-image:url(${STARFIELD_DATA_URI}); background-size:cover; opacity:0.8; }
  .nebula-a { position:absolute; left:-240px; top:-280px; width:940px; height:940px;
    background:radial-gradient(circle, rgba(60,50,120,0.30) 0%, transparent 66%); }
  .nebula-b { position:absolute; left:50%; top:620px; width:1240px; height:1240px; transform:translate(-50%,-50%);
    background:radial-gradient(circle, rgba(201,168,76,0.20) 0%, rgba(201,168,76,0.05) 46%, transparent 70%); }
  .vignette { position:absolute; inset:0; pointer-events:none;
    background:radial-gradient(ellipse 118% 96% at 50% 46%, transparent 52%, rgba(0,0,0,0.62) 100%); }
  .frame { position:absolute; inset:34px; border:1px solid rgba(201,168,76,0.22); border-radius:4px; }
  .wordmark { position:absolute; top:74px; left:0; right:0; text-align:center;
    font-family:'Marcellus',serif; font-size:27px; letter-spacing:7px; color:#B9A05A; text-transform:uppercase; }
  .wordmark::before, .wordmark::after { content:""; display:inline-block; width:64px; height:1px;
    background:rgba(201,168,76,0.45); vertical-align:middle; margin:0 22px; }

  .pill { display:inline-block; padding:19px 54px; border-radius:60px;
    background:linear-gradient(180deg,#F4DE8A,#C9A84C); color:#15110A;
    font-family:'Marcellus',serif; font-size:46px; white-space:nowrap;
    box-shadow:0 14px 44px rgba(201,168,76,0.35); }
  .note { font-family:'Jost',sans-serif; font-weight:300; font-size:27px; color:#9A9AB0; letter-spacing:0.4px; }
  .domain { font-family:'Marcellus',serif; font-size:30px; color:#C9A84C; letter-spacing:1.5px; }

  /* A page of the real report, shown as a physical object. */
  .sheet { position:absolute; border:1px solid rgba(201,168,76,0.5); border-radius:5px;
    box-shadow:0 34px 80px rgba(0,0,0,0.92), 0 0 60px rgba(201,168,76,0.16); background:#0D0D12; }
`;

const FONTS = `<link href="https://fonts.googleapis.com/css2?family=Marcellus&family=Cormorant+Garamond:wght@600;700&family=Jost:wght@300;400;500&display=swap" rel="stylesheet" />`;

interface Assets {
  cover: string;
  money: string;
  months: string;
  name: string;
  compat: string;
}

/** Ad A — the object of desire. Four real pages, fanned, nothing to read but the offer. */
function productAd(a: Assets): string {
  return `<!doctype html><html><head><meta charset="utf-8" />${FONTS}<style>${SHELL_CSS}
  .fan { position:absolute; left:50%; top:606px; width:1080px; height:840px; transform:translate(-50%,-50%); }
  .fan .sheet { left:50%; top:50%; width:392px; }
  .s1 { transform:translate(-50%,-50%) rotate(-15deg) translateX(-252px) scale(0.88); }
  .s2 { transform:translate(-50%,-50%) rotate(-7deg)  translateX(-122px) scale(0.94); }
  .s3 { transform:translate(-50%,-50%) rotate(6deg)   translateX(120px)  scale(0.94); }
  .s4 { transform:translate(-50%,-50%) rotate(14deg)  translateX(250px)  scale(0.88); }
  .s5 { transform:translate(-50%,-50%) rotate(-1deg) scale(1.06); z-index:5;
    box-shadow:0 46px 96px rgba(0,0,0,0.95), 0 0 92px rgba(201,168,76,0.30); }
  .count { position:absolute; top:152px; left:0; right:0; text-align:center;
    font-family:'Cormorant Garamond',serif; font-weight:700; font-size:132px; line-height:1;
    background:linear-gradient(180deg,#FAEBA0 0%,#E6C766 40%,#C9A84C 70%,#8A6E2F 100%);
    -webkit-background-clip:text; background-clip:text; color:transparent;
    filter:drop-shadow(0 0 48px rgba(201,168,76,0.45)); }
  .count small { display:block; font-family:'Marcellus',serif; font-size:33px; letter-spacing:6px;
    color:#B9A05A; -webkit-text-fill-color:#B9A05A; filter:none; margin-top:-6px; }
  .headline { position:absolute; top:966px; left:80px; right:80px; text-align:center;
    font-family:'Cormorant Garamond',serif; font-weight:600; font-size:58px; line-height:1.24; color:#ECECF4; }
  .headline .gold { color:#E6C766; }
  .bottom { position:absolute; left:0; right:0; bottom:62px; text-align:center; }
  .bottom .note { margin-top:20px; }
  </style></head><body>
  <div class="canvas">
    <div class="stars"></div><div class="nebula-a"></div><div class="nebula-b"></div>
    ${spark(180, 330, 30, 0.85)}${spark(892, 286, 22, 0.7)}${spark(936, 742, 34, 0.8)}${spark(128, 812, 20, 0.6)}
    <div class="fan">
      <img class="sheet s1" src="${a.compat}" />
      <img class="sheet s4" src="${a.months}" />
      <img class="sheet s2" src="${a.name}" />
      <img class="sheet s3" src="${a.money}" />
      <img class="sheet s5" src="${a.cover}" />
    </div>
    <div class="vignette"></div>
    <div class="frame"></div>
    <div class="wordmark">Mystic Digits</div>
    <div class="count">27<small>PAGES</small></div>
    <div class="headline">Aapke <span class="gold">janam-din</span> par likhi gayi,<br/>sirf aapke liye</div>
    <div class="bottom">
      <div class="pill">₹249</div>
      <div class="note">PDF · email par · mysticdigits.in</div>
    </div>
  </div></body></html>`;
}

interface Hook {
  file: string;
  line1: string;
  line2: string;
  sub: string;
  page: keyof Assets;
}

/** Ads B & C — one pain point, one promise, one look at the real page. */
function hookAd(h: Hook, a: Assets): string {
  // Back sheets never repeat the hero page — three different pages read as "there is a lot in here".
  const back = (["months", "compat", "name", "money"] as Array<keyof Assets>)
    .filter((k) => k !== h.page)
    .map((k) => a[k]);
  return `<!doctype html><html><head><meta charset="utf-8" />${FONTS}<style>${SHELL_CSS}
  .hook { position:absolute; top:196px; left:76px; right:76px; text-align:center;
    font-family:'Cormorant Garamond',serif; font-weight:700; font-size:104px; line-height:1.1; color:#F2F2F8; }
  .hook .dim { display:block; color:#9A9AB0; font-weight:600; }
  .hook .gold { display:block;
    background:linear-gradient(180deg,#FAEBA0 0%,#E6C766 42%,#C9A84C 72%,#96792F 100%);
    -webkit-background-clip:text; background-clip:text; color:transparent;
    filter:drop-shadow(0 0 40px rgba(201,168,76,0.42)); }
  .rule { position:absolute; top:460px; left:50%; transform:translateX(-50%); width:200px; height:1px;
    background:linear-gradient(90deg,transparent,rgba(201,168,76,0.85),transparent); }
  .sub { position:absolute; top:504px; left:120px; right:120px; text-align:center;
    font-family:'Jost',sans-serif; font-weight:300; font-size:38px; line-height:1.5; color:#C8C8DA; }
  .sub b { font-weight:500; color:#E6C766; }
  .stack { position:absolute; left:50%; top:912px; transform:translate(-50%,-50%); width:1080px; height:520px; }
  .stack .sheet { left:50%; top:50%; width:318px; }
  .b1 { transform:translate(-50%,-50%) rotate(-9deg) translateX(-186px) scale(0.9); }
  .b2 { transform:translate(-50%,-50%) rotate(8deg) translateX(184px) scale(0.9); }
  .b3 { transform:translate(-50%,-50%) rotate(-1deg) scale(1.04); z-index:5;
    box-shadow:0 44px 92px rgba(0,0,0,0.95), 0 0 86px rgba(201,168,76,0.28); }
  .bottom { position:absolute; left:0; right:0; bottom:68px; text-align:center; }
  .bottom .note { margin-top:18px; }
  </style></head><body>
  <div class="canvas">
    <div class="stars"></div><div class="nebula-a"></div><div class="nebula-b"></div>
    ${spark(104, 742, 26, 0.7)}${spark(986, 706, 20, 0.6)}${spark(946, 236, 30, 0.7)}
    <div class="stack">
      <img class="sheet b1" src="${back[0]}" />
      <img class="sheet b2" src="${back[1]}" />
      <img class="sheet b3" src="${a[h.page]}" />
    </div>
    <div class="vignette"></div>
    <div class="frame"></div>
    <div class="wordmark">Mystic Digits</div>
    <div class="hook"><span class="dim">${h.line1}</span><span class="gold">${h.line2}</span></div>
    <div class="rule"></div>
    <div class="sub">${h.sub}</div>
    <div class="bottom">
      <div class="pill">27 pages · ₹249</div>
      <div class="note">mysticdigits.in</div>
    </div>
  </div></body></html>`;
}

const hooks: Hook[] = [
  {
    file: "ad-2026-09-money-4x5.png",
    line1: "Kamai ho rahi hai.",
    line2: "Bachat kyun nahi?",
    sub: `Aapki <b>janam-tareekh</b> paise ke mamle mein ek hi galti baar baar karwati hai. Report mein wahi galti, aur uska upay.`,
    page: "money",
  },
  {
    file: "ad-2026-09-effort-4x5.png",
    line1: "Mehnat puri.",
    line2: "Result aadha.",
    sub: `Kuch logon ki koshish sahi hoti hai, timing galat. Aapke numbers batate hain <b>kaunsa saal, kaunsa mahina</b> aapka hai.`,
    page: "months",
  },
];

async function main() {
  const chrome = process.env.CHROME_PATH || SYSTEM_CHROME;
  if (!existsSync(chrome)) throw new Error(`Chrome not found at ${chrome}`);

  const assets: Assets = {
    cover: dataUri("public/samples/sample-cover.webp"),
    money: dataUri("public/samples/sample27-money.webp"),
    months: dataUri("public/samples/sample27-months.webp"),
    name: dataUri("public/samples/sample27-name-align.webp"),
    compat: dataUri("public/samples/sample27-compat.webp"),
  };

  const browser = await puppeteer.launch({
    executablePath: chrome,
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--force-color-profile=srgb"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 1 });

  const jobs: Array<[string, string]> = [
    ["ad-2026-09-product-4x5.png", productAd(assets)],
    ...hooks.map((h) => [h.file, hookAd(h, assets)] as [string, string]),
  ];

  for (const [file, html] of jobs) {
    await page.setContent(html, { waitUntil: "load" });
    await page.evaluateHandle("document.fonts.ready");
    await page.waitForNetworkIdle({ idleTime: 500, timeout: 8000 }).catch(() => {});
    const out = path.join(OUT_DIR, file);
    await page.screenshot({ path: out as `${string}.png` });
    console.log("AD ->", out);
  }

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
