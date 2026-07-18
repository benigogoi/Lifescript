/**
 * Mystic Digits — animated reel renderer.
 *
 * Renders a deterministic animated scene (reels/scenes/*.html exposing
 * window.seekMs(t) and window.TOTAL_MS) frame by frame through headless
 * Chrome and pipes the frames straight into ffmpeg — no frame files on disk.
 *
 *   npx tsx scripts/render-reel-frames.ts reels/scenes/reel-07-lucky-day.html
 *
 * Output: reels/out/<slug>/<slug>.mp4 (silent — add trending audio in the IG
 * editor) plus preview-*.png stills every ~2s for a quick visual check.
 * Env: CHROME_PATH to override the browser binary, FPS to override 30.
 */
import puppeteer from "puppeteer";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = path.resolve(__dirname, "..");
const SYSTEM_CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";

function browserPath(): string {
  const p = process.env.CHROME_PATH || SYSTEM_CHROME;
  if (!existsSync(p)) throw new Error(`Chrome not found at ${p}. Set CHROME_PATH.`);
  return p;
}

async function main() {
  const scenePath = process.argv[2];
  if (!scenePath) {
    console.error("Usage: npx tsx scripts/render-reel-frames.ts <scene.html>");
    process.exit(1);
  }
  const abs = path.resolve(ROOT, scenePath);
  const slug = path.basename(abs, ".html");
  const fps = Number(process.env.FPS || 30);
  const outDir = path.join(ROOT, "reels", "out", slug);
  await mkdir(outDir, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: browserPath(),
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--force-color-profile=srgb",
           "--allow-file-access-from-files"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(abs).href, { waitUntil: "networkidle0" });
  await page.evaluateHandle("document.fonts.ready");

  const totalMs = await page.evaluate("window.TOTAL_MS") as number;
  const frames = Math.ceil((totalMs / 1000) * fps);
  console.log(`Scene ${slug}: ${(totalMs / 1000).toFixed(1)}s -> ${frames} frames @ ${fps}fps`);

  const mp4Path = path.join(outDir, `${slug}.mp4`);
  const ff = spawn("ffmpeg", [
    "-y", "-f", "image2pipe", "-framerate", String(fps), "-i", "-",
    "-vf", "format=yuv420p",
    "-c:v", "libx264", "-preset", "medium", "-crf", "19",
    "-movflags", "+faststart",
    mp4Path,
  ], { stdio: ["pipe", "ignore", "inherit"] });
  const ffDone = new Promise<void>((res, rej) => {
    ff.on("close", (code) => (code === 0 ? res() : rej(new Error(`ffmpeg exited ${code}`))));
  });

  const previewEvery = Math.round(fps * 2);
  const stage = await page.$("#stage");
  if (!stage) throw new Error("Scene must have a #stage element");

  for (let i = 0; i < frames; i++) {
    const t = (i * 1000) / fps;
    await page.evaluate(`window.seekMs(${t})`);
    const buf = await stage.screenshot({ type: "png" });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
    if (i % previewEvery === 0) {
      const { writeFile } = await import("node:fs/promises");
      await writeFile(path.join(outDir, `preview-${String(Math.round(t / 1000)).padStart(2, "0")}s.png`), buf);
    }
    if (i % 60 === 0) console.log(`frame ${i}/${frames}`);
  }
  ff.stdin.end();
  await ffDone;
  await browser.close();
  console.log("MP4 ->", mp4Path);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
