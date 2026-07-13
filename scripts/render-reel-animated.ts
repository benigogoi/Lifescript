/**
 * Mystic Digits — ANIMATED reel renderer.
 *
 * Unlike render-reel.ts (static slides), this renders a self-contained HTML
 * timeline (CSS + Web Animations API) frame-by-frame through headless Chrome
 * and assembles the frames into a 30fps MP4 with ffmpeg.
 *
 *   npx tsx scripts/render-reel-animated.ts reels/animated/<reel>.html
 *
 * The HTML declares its own config on <body>:
 *   data-slug="reel-05-..." data-duration-ms="21800" data-fps="30"
 * and must expose window.seekMs(t) that pauses every animation on the page
 * and jumps the whole timeline to t milliseconds.
 *
 * Output: reels/out/<slug>/<slug>.mp4 + cover.jpg (frame from the hook).
 * Requires Chrome (CHROME_PATH env override) and ffmpeg on PATH.
 * Set KEEP_FRAMES=1 to keep the individual JPEG frames for debugging.
 */
import puppeteer from "puppeteer";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { copyFile, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = path.resolve(__dirname, "..");
const SYSTEM_CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";

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

async function main() {
  const htmlArg = process.argv[2];
  if (!htmlArg) {
    console.error("Usage: npx tsx scripts/render-reel-animated.ts <reel.html>");
    process.exit(1);
  }
  const htmlPath = path.resolve(ROOT, htmlArg);
  if (!existsSync(htmlPath)) throw new Error(`Not found: ${htmlPath}`);

  const browser = await puppeteer.launch({
    executablePath: browserPath(),
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--force-color-profile=srgb"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle0" });
  await page.evaluateHandle("document.fonts.ready");

  const cfg = await page.evaluate(() => ({
    slug: document.body.dataset.slug ?? "animated-reel",
    durationMs: Number(document.body.dataset.durationMs ?? 20000),
    fps: Number(document.body.dataset.fps ?? 30),
    coverMs: Number(document.body.dataset.coverMs ?? 1400),
  }));

  const outDir = path.join(ROOT, "reels", "out", cfg.slug);
  const framesDir = path.join(outDir, "frames");
  await mkdir(framesDir, { recursive: true });

  const totalFrames = Math.round((cfg.durationMs / 1000) * cfg.fps);
  const coverFrame = Math.min(
    totalFrames - 1,
    Math.round((cfg.coverMs / 1000) * cfg.fps),
  );
  console.log(`${cfg.slug}: ${totalFrames} frames @ ${cfg.fps}fps (${cfg.durationMs}ms)`);

  for (let i = 0; i < totalFrames; i++) {
    const t = (i / cfg.fps) * 1000;
    await page.evaluate((ms) => (window as any).seekMs(ms), t);
    const file = path.join(framesDir, `frame-${String(i).padStart(5, "0")}.jpg`);
    await page.screenshot({ path: file as `${string}.jpeg`, type: "jpeg", quality: 92 });
    if (i % 60 === 0) console.log(`  frame ${i}/${totalFrames}`);
  }
  await browser.close();

  await copyFile(
    path.join(framesDir, `frame-${String(coverFrame).padStart(5, "0")}.jpg`),
    path.join(outDir, "cover.jpg"),
  );

  const ffmpeg = ffmpegPath();
  if (!ffmpeg) {
    console.log("\nffmpeg not found — frames left in", framesDir);
    return;
  }
  const mp4Path = path.join(outDir, `${cfg.slug}.mp4`);
  execFileSync(ffmpeg, [
    "-y", "-framerate", String(cfg.fps),
    "-i", path.join(framesDir, "frame-%05d.jpg"),
    "-c:v", "libx264", "-preset", "medium", "-crf", "18",
    "-pix_fmt", "yuv420p",
    mp4Path,
  ]);
  console.log("MP4 ->", mp4Path);

  if (!process.env.KEEP_FRAMES) await rm(framesDir, { recursive: true, force: true });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
