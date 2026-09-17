/**
 * Mystic Digits — Meta video ad (1080×1920, 9:16, 12s, silent-safe).
 *
 * Deterministic frame renderer: the page exposes window.setT(seconds) and every
 * element's opacity/transform is a pure function of t, so frames are exact and
 * re-runnable (no CSS animation timing drift). Frames -> ffmpeg -> MP4.
 *
 *   CHROME_PATH="C:/Program Files/Google/Chrome/Application/chrome.exe" npx tsx scripts/render-ad-video-2026-09.ts money
 *
 * Variants: money (default) | effort
 * In:  public/samples/sample27-*.webp, sample-cover.webp
 * Out: meta posts/ad-video-2026-09-<variant>-9x16.mp4
 *
 * Designed to work with the sound off: every claim is on screen.
 */
import puppeteer from "puppeteer";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { STARFIELD_DATA_URI } from "../src/lib/starfield";

const ROOT = path.resolve(__dirname, "..");
const SYSTEM_CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const OUT_DIR = path.join(ROOT, "meta posts");
const FRAME_DIR = path.join(ROOT, "meta posts", ".frames");
const FPS = 30;
const DURATION = 12;
const W = 1080;
const H = 1920;

function dataUri(rel: string): string {
  const p = path.join(ROOT, rel);
  if (!existsSync(p)) throw new Error(`Missing asset: ${p}`);
  const mime = p.endsWith(".webp") ? "image/webp" : "image/png";
  return `data:${mime};base64,${readFileSync(p).toString("base64")}`;
}

interface Variant {
  slug: string;
  line1: string;
  line2: string;
  sub: string;
  proof: string;
  heroPage: "money" | "months";
}

const VARIANTS: Record<string, Variant> = {
  money: {
    slug: "money",
    line1: "Kamai ho rahi hai.",
    line2: "Bachat kyun nahi?",
    sub: "Aapki janam-tareekh paise ke mamle mein<br/>ek hi galti baar baar karwati hai.",
    proof: "Wahi galti, aur uska upay —<br/>aapki report ke andar.",
    heroPage: "money",
  },
  effort: {
    slug: "effort",
    line1: "Mehnat puri.",
    line2: "Result aadha.",
    sub: "Koshish sahi hoti hai,<br/>timing galat.",
    proof: "Kaunsa saal, kaunsa mahina aapka hai —<br/>numbers batate hain.",
    heroPage: "months",
  },
};

function html(v: Variant, a: Record<string, string>): string {
  return `<!doctype html><html><head><meta charset="utf-8" />
<link href="https://fonts.googleapis.com/css2?family=Marcellus&family=Cormorant+Garamond:wght@600;700&family=Jost:wght@300;400;500&display=swap" rel="stylesheet" />
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html,body { width:${W}px; height:${H}px; overflow:hidden; background:#0D0D12; }
  .canvas { position:relative; width:${W}px; height:${H}px; overflow:hidden; background:#0D0D12;
    font-feature-settings:'lnum' 1,'tnum' 1; }
  .stars { position:absolute; inset:-6%; background-image:url(${STARFIELD_DATA_URI}); background-size:cover; opacity:0.8; }
  .nebula { position:absolute; left:50%; top:52%; width:1500px; height:1500px; transform:translate(-50%,-50%);
    background:radial-gradient(circle, rgba(201,168,76,0.20) 0%, rgba(201,168,76,0.05) 46%, transparent 70%); }
  .nebula-b { position:absolute; left:-280px; top:-320px; width:1100px; height:1100px;
    background:radial-gradient(circle, rgba(60,50,120,0.32) 0%, transparent 66%); }
  .vignette { position:absolute; inset:0;
    background:radial-gradient(ellipse 116% 92% at 50% 46%, transparent 50%, rgba(0,0,0,0.66) 100%); }
  .frame { position:absolute; inset:38px; border:1px solid rgba(201,168,76,0.22); border-radius:4px; }
  .wordmark { position:absolute; top:96px; left:0; right:0; text-align:center;
    font-family:'Marcellus',serif; font-size:30px; letter-spacing:8px; color:#B9A05A; text-transform:uppercase; }
  .wordmark::before, .wordmark::after { content:""; display:inline-block; width:70px; height:1px;
    background:rgba(201,168,76,0.45); vertical-align:middle; margin:0 24px; }

  .stage { position:absolute; left:0; right:0; top:624px; height:1040px; }
  .sheet { position:absolute; left:50%; top:50%; width:668px; margin-left:-334px; margin-top:-466px;
    border:1px solid rgba(201,168,76,0.5); border-radius:6px; background:#0D0D12;
    box-shadow:0 44px 96px rgba(0,0,0,0.95), 0 0 90px rgba(201,168,76,0.22); }

  .hook { position:absolute; top:520px; left:80px; right:80px; text-align:center;
    font-family:'Cormorant Garamond',serif; font-weight:700; font-size:118px; line-height:1.08; }
  .hook .l1 { display:block; color:#C4C4D6; }
  .hook .l2 { display:block;
    background:linear-gradient(180deg,#FAEBA0 0%,#E6C766 42%,#C9A84C 72%,#96792F 100%);
    -webkit-background-clip:text; background-clip:text; color:transparent; }

  .caption { position:absolute; left:90px; right:90px; text-align:center;
    font-family:'Jost',sans-serif; font-weight:300; font-size:44px; line-height:1.48; color:#D2D2E2; }
  .sub { top:900px; }
  .proof { top:430px; }
  .count { position:absolute; top:300px; left:0; right:0; text-align:center;
    font-family:'Cormorant Garamond',serif; font-weight:700; font-size:150px; line-height:1;
    background:linear-gradient(180deg,#FAEBA0 0%,#E6C766 40%,#C9A84C 70%,#8A6E2F 100%);
    -webkit-background-clip:text; background-clip:text; color:transparent; }
  .count small { display:block; font-family:'Marcellus',serif; font-size:36px; letter-spacing:8px;
    color:#B9A05A; -webkit-text-fill-color:#B9A05A; margin-top:2px; }

  .pill { position:absolute; left:50%; bottom:300px; transform:translateX(-50%);
    padding:26px 74px; border-radius:70px; background:linear-gradient(180deg,#F4DE8A,#C9A84C); color:#15110A;
    font-family:'Marcellus',serif; font-size:60px; white-space:nowrap;
    box-shadow:0 18px 56px rgba(201,168,76,0.4); }
  .cta { position:absolute; left:0; right:0; bottom:196px; text-align:center;
    font-family:'Jost',sans-serif; font-weight:400; font-size:40px; letter-spacing:1px; color:#E6C766; }
  .note { position:absolute; left:0; right:0; bottom:128px; text-align:center;
    font-family:'Jost',sans-serif; font-weight:300; font-size:32px; color:#9A9AB0; }
</style></head>
<body><div class="canvas" id="canvas">
  <div class="stars" id="stars"></div>
  <div class="nebula-b"></div>
  <div class="nebula" id="nebula"></div>
  <div class="stage">
    <img class="sheet" id="p1" src="${a[v.heroPage]}" />
    <img class="sheet" id="p2" src="${a.compat}" />
    <img class="sheet" id="p3" src="${a.name}" />
    <img class="sheet" id="p4" src="${a.cover}" />
  </div>
  <div class="vignette"></div>
  <div class="frame"></div>
  <div class="wordmark" id="wordmark">Mystic Digits</div>
  <div class="hook" id="hook"><span class="l1">${v.line1}</span><span class="l2">${v.line2}</span></div>
  <div class="caption sub" id="sub">${v.sub}</div>
  <div class="caption proof" id="proof">${v.proof}</div>
  <div class="count" id="count">27<small>PAGES</small></div>
  <div class="pill" id="pill">₹249</div>
  <div class="cta" id="cta">Apni report abhi lijiye ↗</div>
  <div class="note" id="note">PDF · email par · mysticdigits.in</div>
</div>
<script>
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const inv = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const easeOut = (x) => 1 - Math.pow(1 - x, 3);
const easeInOut = (x) => x < 0.5 ? 4*x*x*x : 1 - Math.pow(-2*x + 2, 3) / 2;
/** Fade in over inDur, hold, then fade out over outDur before end. */
function band(t, start, end, inDur, outDur) {
  const rise = easeOut(inv(t, start, start + inDur));
  const fall = 1 - easeOut(inv(t, end - outDur, end));
  return Math.min(rise, fall);
}
const el = (id) => document.getElementById(id);

window.setT = function (t) {
  // Slow drift on the background for the whole 12s — keeps the frame alive.
  const drift = t / 12;
  el('stars').style.transform = 'scale(' + (1.02 + drift * 0.05) + ') translateY(' + (-drift * 26) + 'px)';
  el('nebula').style.opacity = String(0.85 + 0.15 * Math.sin(t * 0.9));

  el('wordmark').style.opacity = String(band(t, 0.1, 12, 0.7, 0.4));

  // 1. Hook (0 - 3.4s)
  const hookA = band(t, 0.25, 3.5, 0.7, 0.45);
  el('hook').style.opacity = String(hookA);
  el('hook').style.transform = 'translateY(' + (34 * (1 - easeOut(inv(t, 0.25, 1.2))) - 26 * easeOut(inv(t, 3.05, 3.5))) + 'px)';
  el('hook').querySelector('.l2').style.opacity = String(easeOut(inv(t, 1.0, 1.9)));

  // 2. Sub line under the hook (0.9 - 3.4s)
  el('sub').style.opacity = String(band(t, 1.5, 3.5, 0.6, 0.4));
  el('sub').style.transform = 'translateY(' + (22 * (1 - easeOut(inv(t, 1.5, 2.3)))) + 'px)';

  // 3. Pages (3.3 - 9.2s): hero rises, then two swap past it.
  const pages = [
    { id: 'p1', start: 3.3, end: 6.4, from: 150, rot: -2 },
    { id: 'p2', start: 6.0, end: 7.9, from: 120, rot: 3 },
    { id: 'p3', start: 7.5, end: 9.3, from: 120, rot: -3 },
  ];
  for (const p of pages) {
    const a = band(t, p.start, p.end, 0.55, 0.45);
    const rise = easeOut(inv(t, p.start, p.start + 0.9));
    const zoom = 0.94 + 0.08 * easeInOut(inv(t, p.start, p.end));
    el(p.id).style.opacity = String(a);
    el(p.id).style.transform = 'translateY(' + (p.from * (1 - rise)) + 'px) rotate(' + (p.rot * (1 - rise * 0.4)) + 'deg) scale(' + zoom + ')';
  }

  // 4. "27 PAGES" counts up while the pages play (4.2 - 9.3s)
  const countA = band(t, 4.2, 7.0, 0.6, 0.45);
  el('count').style.opacity = String(countA);
  const n = Math.round(1 + 26 * easeOut(inv(t, 4.2, 6.2)));
  el('count').firstChild.nodeValue = String(n);
  el('count').style.transform = 'scale(' + (0.94 + 0.06 * easeOut(inv(t, 4.2, 5.2))) + ')';

  // 5. Proof line (6.5 - 9.3s)
  el('proof').style.opacity = String(band(t, 7.15, 9.35, 0.55, 0.45));

  // 6. Close: cover + price + CTA (9.1 - 12s)
  const coverA = band(t, 9.1, 12.2, 0.6, 0);
  const coverRise = easeOut(inv(t, 9.1, 10.1));
  el('p4').style.opacity = String(coverA);
  el('p4').style.transform = 'translateY(' + (110 * (1 - coverRise)) + 'px) scale(' + (0.92 + 0.10 * coverRise) + ')';
  const pillA = easeOut(inv(t, 9.9, 10.5));
  el('pill').style.opacity = String(pillA);
  el('pill').style.transform = 'translateX(-50%) scale(' + (0.86 + 0.14 * easeOut(inv(t, 9.9, 10.7))) + ')';
  el('cta').style.opacity = String(easeOut(inv(t, 10.4, 11.0)) * (0.82 + 0.18 * Math.sin(t * 5)));
  el('note').style.opacity = String(easeOut(inv(t, 10.7, 11.3)));
};
window.setT(0);
</script></body></html>`;
}

async function main() {
  const which = (process.argv[2] || "money").toLowerCase();
  const v = VARIANTS[which];
  if (!v) throw new Error(`Unknown variant "${which}". Use: ${Object.keys(VARIANTS).join(" | ")}`);

  const chrome = process.env.CHROME_PATH || SYSTEM_CHROME;
  if (!existsSync(chrome)) throw new Error(`Chrome not found at ${chrome}`);

  const assets = {
    cover: dataUri("public/samples/sample-cover.webp"),
    money: dataUri("public/samples/sample27-money.webp"),
    months: dataUri("public/samples/sample27-months.webp"),
    name: dataUri("public/samples/sample27-name-align.webp"),
    compat: dataUri("public/samples/sample27-compat.webp"),
  };

  rmSync(FRAME_DIR, { recursive: true, force: true });
  mkdirSync(FRAME_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: chrome,
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--force-color-profile=srgb"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
  await page.setContent(html(v, assets), { waitUntil: "load" });
  await page.evaluateHandle("document.fonts.ready");
  await page.waitForNetworkIdle({ idleTime: 500, timeout: 10000 }).catch(() => {});

  const total = DURATION * FPS;
  for (let i = 0; i < total; i++) {
    await page.evaluate((t) => (window as unknown as { setT(t: number): void }).setT(t), i / FPS);
    const file = path.join(FRAME_DIR, `f${String(i).padStart(4, "0")}.jpg`);
    await page.screenshot({ path: file as `${string}.jpg`, type: "jpeg", quality: 95 });
    if (i % 60 === 0) console.log(`frame ${i}/${total}`);
  }
  await browser.close();

  const out = path.join(OUT_DIR, `ad-video-2026-09-${v.slug}-9x16.mp4`);
  execFileSync(
    "ffmpeg",
    ["-y", "-framerate", String(FPS), "-i", path.join(FRAME_DIR, "f%04d.jpg"),
     "-c:v", "libx264", "-preset", "slow", "-crf", "19", "-pix_fmt", "yuv420p",
     "-movflags", "+faststart", out],
    { stdio: "inherit" },
  );
  if (!process.env.KEEP_FRAMES) rmSync(FRAME_DIR, { recursive: true, force: true });
  console.log("VIDEO ->", out);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
