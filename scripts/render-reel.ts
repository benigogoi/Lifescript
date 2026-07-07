/**
 * Mystic Digits — faceless reel slide generator.
 *
 * Renders a reel spec (JSON) into 1080x1920 brand-styled PNG slides via the
 * same headless-Chrome pipeline as the PDF reports, and — when ffmpeg is on
 * PATH — assembles them into a ready-to-post MP4 (silent; add trending audio
 * in the Instagram app, which also helps reach).
 *
 *   npx tsx scripts/render-reel.ts reels/specs/reel-01-what-is-mulank.json
 *
 * Spec shape: { slug, slides: [{ kind, eyebrow?, title, body?, items?, durationSec }] }
 * kind: "text" (default) | "list" | "end". The "end" slide shows the logo.
 */
import puppeteer from "puppeteer";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = path.resolve(__dirname, "..");
const SYSTEM_CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";

interface ReelSlide {
  kind?: "text" | "list" | "end";
  eyebrow?: string;
  title: string;
  body?: string;
  items?: string[];
  durationSec: number;
}
interface ReelSpec {
  slug: string;
  slides: ReelSlide[];
}

function browserPath(): string {
  const p = process.env.CHROME_PATH || SYSTEM_CHROME;
  if (!existsSync(p)) throw new Error(`Chrome not found at ${p}. Set CHROME_PATH.`);
  return p;
}

function ffmpegPath(): string | null {
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
  return null;
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function slideHtml(s: ReelSlide, logoUrl: string): string {
  const kind = s.kind ?? "text";
  if (kind === "end") {
    return `<div class="slide end">
      <div class="frame"></div>
      <img class="logo" src="${logoUrl}" alt="" />
      <div class="title">${esc(s.title)}</div>
      ${s.body ? `<div class="body gold">${esc(s.body)}</div>` : ""}
    </div>`;
  }
  if (kind === "list") {
    return `<div class="slide">
      <div class="frame"></div>
      ${s.eyebrow ? `<div class="eyebrow">${esc(s.eyebrow)}</div>` : ""}
      <div class="title">${esc(s.title)}</div>
      <ul class="list">${(s.items ?? []).map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
      ${s.body ? `<div class="body">${esc(s.body)}</div>` : ""}
    </div>`;
  }
  return `<div class="slide">
    <div class="frame"></div>
    ${s.eyebrow ? `<div class="eyebrow">${esc(s.eyebrow)}</div>` : ""}
    <div class="title">${esc(s.title)}</div>
    ${s.body ? `<div class="body">${esc(s.body)}</div>` : ""}
  </div>`;
}

function buildHtml(spec: ReelSpec, logoUrl: string): string {
  return `<!doctype html>
<html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,600&family=Marcellus&family=Jost:wght@400;500&display=swap" rel="stylesheet">
<style>
  :root {
    --bg: #0d0d12; --bg-deep: #05050a;
    --gold: #c9a84c; --gold-bright: #e6c766;
    --white: #e8e8f0; --muted: #9a9ab0;
    --line: rgba(201, 168, 76, 0.35);
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #000; }
  .slide {
    position: relative;
    width: 1080px; height: 1920px;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    text-align: center;
    padding: 140px 110px;
    background:
      radial-gradient(1200px 900px at 50% 12%, rgba(201,168,76,0.10), transparent 60%),
      radial-gradient(2px 2px at 18% 22%, rgba(232,232,240,0.5), transparent 40%),
      radial-gradient(2px 2px at 78% 15%, rgba(232,232,240,0.4), transparent 40%),
      radial-gradient(1.5px 1.5px at 30% 78%, rgba(232,232,240,0.35), transparent 40%),
      radial-gradient(2px 2px at 68% 85%, rgba(232,232,240,0.4), transparent 40%),
      radial-gradient(1.5px 1.5px at 88% 55%, rgba(232,232,240,0.3), transparent 40%),
      radial-gradient(1.5px 1.5px at 10% 55%, rgba(232,232,240,0.3), transparent 40%),
      linear-gradient(180deg, var(--bg) 0%, var(--bg-deep) 100%);
  }
  .frame {
    position: absolute; inset: 54px;
    border: 1.5px solid var(--line);
    border-radius: 14px;
    pointer-events: none;
  }
  .eyebrow {
    font-family: 'Marcellus', serif;
    font-size: 34px; letter-spacing: 10px;
    text-transform: uppercase;
    color: var(--gold);
    margin-bottom: 56px;
  }
  .title {
    font-family: 'Cormorant Garamond', serif;
    font-weight: 600;
    font-size: 108px; line-height: 1.12;
    color: var(--white);
    max-width: 860px;
  }
  .title em { color: var(--gold-bright); font-style: italic; }
  .body {
    font-family: 'Jost', sans-serif;
    font-weight: 400;
    font-size: 46px; line-height: 1.45;
    color: var(--muted);
    max-width: 780px;
    margin-top: 64px;
  }
  .body.gold { color: var(--gold-bright); font-family: 'Marcellus', serif; letter-spacing: 2px; }
  .list {
    list-style: none;
    margin-top: 70px;
    font-family: 'Cormorant Garamond', serif;
    font-size: 58px; line-height: 1.72;
    color: var(--white);
  }
  .list li strong, .list li { font-weight: 600; }
  .logo { width: 300px; height: 300px; object-fit: contain; margin-bottom: 40px; }
  .end .title { font-size: 88px; }
</style></head>
<body>${spec.slides.map((s) => slideHtml(s, logoUrl)).join("\n")}</body></html>`;
}

async function main() {
  const specPath = process.argv[2];
  if (!specPath) {
    console.error("Usage: npx tsx scripts/render-reel.ts <spec.json>");
    process.exit(1);
  }
  const spec: ReelSpec = JSON.parse(readFileSync(path.resolve(ROOT, specPath), "utf8"));
  const outDir = path.join(ROOT, "reels", "out", spec.slug);
  await mkdir(outDir, { recursive: true });

  const logoUrl = pathToFileURL(path.join(ROOT, "public", "logo.png")).href;
  const htmlPath = path.join(outDir, "slides.html");
  await writeFile(htmlPath, buildHtml(spec, logoUrl), "utf8");

  const browser = await puppeteer.launch({
    executablePath: browserPath(),
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--force-color-profile=srgb"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle0" });
  await page.evaluateHandle("document.fonts.ready");

  const slides = await page.$$(".slide");
  const frames: { file: string; durationSec: number }[] = [];
  for (let i = 0; i < slides.length; i++) {
    const file = path.join(outDir, `slide-${String(i + 1).padStart(2, "0")}.png`);
    await slides[i].screenshot({ path: file as `${string}.png` });
    frames.push({ file, durationSec: spec.slides[i].durationSec });
    console.log("PNG ->", file);
  }
  await browser.close();

  const ffmpeg = ffmpegPath();
  if (!ffmpeg) {
    console.log("\nffmpeg not found — PNGs are ready to assemble in CapCut/Instagram.");
    return;
  }
  // concat demuxer: each image shown for its duration (last image repeated per spec).
  const listPath = path.join(outDir, "frames.txt");
  const lines = frames
    .map((f) => `file '${f.file.replace(/\\/g, "/")}'\nduration ${f.durationSec}`)
    .join("\n");
  await writeFile(listPath, `${lines}\nfile '${frames[frames.length - 1].file.replace(/\\/g, "/")}'\n`, "utf8");
  const mp4Path = path.join(outDir, `${spec.slug}.mp4`);
  execFileSync(ffmpeg, [
    "-y", "-f", "concat", "-safe", "0", "-i", listPath,
    "-vf", "format=yuv420p,fps=30",
    "-c:v", "libx264", "-preset", "medium", "-crf", "19",
    mp4Path,
  ]);
  console.log("MP4 ->", mp4Path);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
