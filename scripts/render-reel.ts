/**
 * Mystic Digits — animated reel renderer.
 *
 * Turns a reel spec (reels/specs/*.json) into a ready-to-post 1080x1920 MP4.
 * The page in scripts/reel/ animates every element as a pure function of time;
 * this script steps that clock frame by frame in headless Chrome, screenshots
 * each frame and pipes it into ffmpeg. Deterministic, so a re-render of an
 * unchanged spec is the same video.
 *
 *   npx tsx scripts/render-reel.ts reels/specs/r01-dhoni-seven.json
 *   npx tsx scripts/render-reel.ts --all                 # every spec
 *   npx tsx scripts/render-reel.ts --all --stills        # + one still per scene, for review
 *   npx tsx scripts/render-reel.ts --all --stills-only   # stills only, no video (fast)
 *
 * Output: reels/out/<slug>/<slug>.mp4 and cover.jpg (the hook frame, for the
 * grid). The MP4 carries a silent audio track: add a trending sound in the
 * Instagram editor — that's a reach lever, not decoration.
 *
 * Needs Chrome/Chromium (CHROME_PATH, else the usual install locations) and
 * ffmpeg on PATH.
 */
import puppeteer, { type Browser, type Page } from "puppeteer";
import { execFileSync, spawn } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { once } from "node:events";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = path.resolve(__dirname, "..");
const SPECS_DIR = path.join(ROOT, "reels", "specs");
const OUT_DIR = path.join(ROOT, "reels", "out");
const FPS = 30;

interface Scene {
  type: string;
  src?: string;
  [key: string]: unknown;
}
interface ReelSpec {
  slug: string;
  /** night (default) | paper | notebook | bold | planet | chat — see scripts/reel/engine.js */
  style?: string;
  accent?: string;
  scenes: Scene[];
}
interface Timeline {
  duration: number;
  /** The moment that makes the best cover frame (the hook, fully landed). */
  coverAt: number;
  scenes: { type: string; start: number; dur: number }[];
}

function chromePath(): string {
  const candidates = [
    process.env.CHROME_PATH,
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ];
  if (existsSync("/opt/pw-browsers")) {
    for (const d of readdirSync("/opt/pw-browsers")) {
      if (d.startsWith("chromium-")) candidates.push(`/opt/pw-browsers/${d}/chrome-linux/chrome`);
    }
  }
  const found = candidates.find((p) => p && existsSync(p));
  if (!found) throw new Error("Chrome not found. Set CHROME_PATH.");
  return found;
}

function ffmpegPath(): string {
  const candidates = [
    "ffmpeg",
    path.join(process.env.LOCALAPPDATA ?? "", "Microsoft/WinGet/Links/ffmpeg.exe"),
  ];
  for (const c of candidates) {
    try {
      execFileSync(c, ["-version"], { stdio: "ignore" });
      return c;
    } catch {
      /* keep looking */
    }
  }
  throw new Error("ffmpeg not found on PATH.");
}

// The mandala motif from src/components/Mandala.tsx, as a static string.
function mandalaSvg(): string {
  const spokes = Array.from({ length: 12 }, (_, i) => (i * 360) / 12).map((deg) => {
    const rad = (deg * Math.PI) / 180;
    return { x: 220 + 220 * Math.sin(rad), y: 220 - 220 * Math.cos(rad) };
  });
  return `<svg viewBox="0 0 440 440" fill="none">
    <g stroke="currentColor" stroke-width="0.75" opacity="0.55">
      ${[220, 180, 140].map((r) => `<circle cx="220" cy="220" r="${r}"/>`).join("")}
      ${spokes.map((p) => `<line x1="220" y1="220" x2="${p.x}" y2="${p.y}"/>`).join("")}
    </g>
    <g stroke="currentColor" stroke-width="1">
      <polygon points="220,80 339,290 101,290" opacity="0.7"/>
      <polygon points="220,360 101,150 339,150" opacity="0.7"/>
    </g>
    <circle cx="220" cy="220" r="44" stroke="currentColor" stroke-width="1.1"/>
    <circle cx="220" cy="220" r="3.5" fill="currentColor"/>
    ${spokes.map((p) => `<circle cx="${p.x}" cy="${p.y}" r="2.2" fill="currentColor" opacity="0.8"/>`).join("")}
  </svg>`;
}

function buildHtml(spec: ReelSpec): string {
  // Repo-relative asset paths in the spec become file:// URLs for the page.
  const resolved: ReelSpec = {
    ...spec,
    scenes: spec.scenes.map((s) =>
      s.src ? { ...s, src: pathToFileURL(path.join(ROOT, s.src)).href } : s,
    ),
  };
  const css = readFileSync(path.join(__dirname, "reel", "reel.css"), "utf8");
  const engine = readFileSync(path.join(__dirname, "reel", "engine.js"), "utf8");
  const logo = pathToFileURL(path.join(ROOT, "public", "logo.png")).href;
  // JSON inside a <script> must not be able to close the tag.
  const json = JSON.stringify(resolved).replace(/</g, "\\u003c");
  return `<!doctype html>
<html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,600&family=Marcellus&family=Jost:wght@400;500;600&family=Playfair+Display:wght@700;800&family=Lora:ital,wght@1,500&family=Kalam:wght@400;700&family=Anton&family=Archivo:wght@600;800&family=Outfit:wght@400;500;600;700&display=block" rel="stylesheet">
<style>${css}${spec.accent ? `:root{--accent:${spec.accent}}` : ""}</style>
</head><body>
<div id="stage" class="theme-${spec.style ?? "night"}">
  <canvas id="stars" width="1080" height="1920"></canvas>
  <div id="decor"></div>
  <div id="glow"></div>
  <div id="mandala">${mandalaSvg()}</div>
  <div id="vignette"></div>
  <div id="scenes"></div>
  <div id="frame"></div>
  <div id="flash"></div>
  <div id="brand"><i></i>MYSTIC DIGITS<i></i></div>
</div>
<img id="logo-src" src="${logo}" alt="" style="display:none">
<script>window.__SPEC = ${json}; window.__LOGO = ${JSON.stringify(logo)};</script>
<script>${engine}</script>
</body></html>`;
}

async function openReel(browser: Browser, spec: ReelSpec, outDir: string): Promise<{ page: Page; timeline: Timeline }> {
  const htmlPath = path.join(outDir, "reel.html");
  await writeFile(htmlPath, buildHtml(spec), "utf8");
  const page = await browser.newPage();
  page.on("pageerror", (e) => console.error(`[${spec.slug}] page error:`, e));
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle0", timeout: 60_000 });
  await page.evaluate(async () => {
    // Hidden scenes don't request their fonts, so load every face up front:
    // text sized (fit) or shot before its font arrives would be wrong or blank.
    await Promise.all(
      [
        '500 100px "Cormorant Garamond"', '600 100px "Cormorant Garamond"',
        '700 100px "Cormorant Garamond"', 'italic 600 100px "Cormorant Garamond"',
        '400 40px "Marcellus"', '400 40px "Jost"', '500 40px "Jost"', '600 40px "Jost"',
        '700 100px "Playfair Display"', '800 100px "Playfair Display"', 'italic 500 40px "Lora"',
        '400 40px "Kalam"', '700 100px "Kalam"', '400 100px "Anton"', '600 40px "Archivo"', '800 40px "Archivo"',
        '400 40px "Outfit"', '500 40px "Outfit"', '600 100px "Outfit"', '700 100px "Outfit"',
      ].map((f) => document.fonts.load(f, "Aa0123456789")),
    );
    await document.fonts.ready;
    await Promise.all(
      [...document.images].map((img) => (img.complete ? null : new Promise((r) => (img.onload = img.onerror = r)))),
    );
  });
  const timeline = (await page.evaluate("window.__init()")) as Timeline;
  return { page, timeline };
}

async function shot(page: Page, t: number, quality = 92): Promise<Buffer> {
  await page.evaluate((x) => (window as unknown as { __seek: (t: number) => void }).__seek(x), t);
  return Buffer.from(await page.screenshot({ type: "jpeg", quality, optimizeForSpeed: true }));
}

async function renderReel(browser: Browser, specPath: string, opts: { stills: boolean; video: boolean }) {
  const spec: ReelSpec = JSON.parse(readFileSync(specPath, "utf8"));
  const outDir = path.join(OUT_DIR, spec.slug);
  await mkdir(outDir, { recursive: true });
  const { page, timeline } = await openReel(browser, spec, outDir);
  const started = Date.now();

  // Cover = the hook once it has fully landed, for the profile grid.
  await writeFile(path.join(outDir, "cover.jpg"), await shot(page, timeline.coverAt, 94));

  if (opts.stills) {
    const dir = path.join(outDir, "stills");
    await rm(dir, { recursive: true, force: true }); // no stale stills from a longer earlier cut
    await mkdir(dir, { recursive: true });
    for (const [i, sc] of timeline.scenes.entries()) {
      const t = sc.start + Math.max(0.2, Math.min(sc.dur * 0.8, sc.dur - 0.22));
      await writeFile(path.join(dir, `${String(i + 1).padStart(2, "0")}-${sc.type}.jpg`), await shot(page, t, 80));
    }
  }

  if (opts.video) {
    const mp4 = path.join(outDir, `${spec.slug}.mp4`);
    const ff = spawn(ffmpegPath(), [
      "-y", "-loglevel", "error",
      "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-",
      "-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo",
      "-shortest",
      "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p",
      "-profile:v", "high", "-r", String(FPS), "-g", String(FPS * 2),
      "-c:a", "aac", "-b:a", "128k",
      "-movflags", "+faststart",
      mp4,
    ], { stdio: ["pipe", "inherit", "inherit"] });
    const done = once(ff, "close");
    const frames = Math.round(timeline.duration * FPS);
    for (let i = 0; i < frames; i++) {
      const buf = await shot(page, i / FPS);
      if (!ff.stdin.write(buf)) await once(ff.stdin, "drain");
    }
    ff.stdin.end();
    const [code] = await done;
    if (code !== 0) throw new Error(`ffmpeg exited ${code} for ${spec.slug}`);
    console.log(`MP4 -> ${path.relative(ROOT, mp4)}  (${timeline.duration.toFixed(1)}s, ${((Date.now() - started) / 1000).toFixed(0)}s to render)`);
  } else {
    console.log(`stills -> ${path.relative(ROOT, outDir)}  (${timeline.duration.toFixed(1)}s reel)`);
  }
  await page.close();
}

async function main() {
  const args = process.argv.slice(2);
  const flags = new Set(args.filter((a) => a.startsWith("--")));
  const conc = Number(args.find((a) => a.startsWith("--concurrency="))?.split("=")[1] ?? 2);
  let specs = args.filter((a) => !a.startsWith("--")).map((a) => path.resolve(ROOT, a));
  if (flags.has("--all")) {
    specs = readdirSync(SPECS_DIR).filter((f) => f.endsWith(".json")).sort().map((f) => path.join(SPECS_DIR, f));
  }
  if (!specs.length) {
    console.error("Usage: npx tsx scripts/render-reel.ts <spec.json ...> | --all [--stills] [--stills-only] [--concurrency=N]");
    process.exit(1);
  }
  const opts = { stills: flags.has("--stills") || flags.has("--stills-only"), video: !flags.has("--stills-only") };

  const queue = [...specs];
  let failed = 0;
  // One browser per worker: a background tab in a shared browser never paints,
  // so its screenshots hang until the protocol timeout.
  await Promise.all(
    Array.from({ length: Math.min(conc, queue.length) }, async () => {
      const browser = await puppeteer.launch({
        executablePath: chromePath(),
        headless: true,
        args: ["--no-sandbox", "--disable-dev-shm-usage", "--force-color-profile=srgb", "--hide-scrollbars"],
      });
      for (let s = queue.shift(); s; s = queue.shift()) {
        try {
          await renderReel(browser, s, opts);
        } catch (e) {
          failed++;
          console.error(`FAILED ${path.basename(s)}:`, e);
        }
      }
      await browser.close();
    }),
  );
  if (failed) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
