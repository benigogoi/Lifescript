/** One-time: bake the CSS-gradient starfield into a single PNG data URI so the
 * report PDF draws one image per page instead of ~180 gradient patterns.
 * Renders the star layer IN ISOLATION (no report content) so nothing else is
 * captured. Opaque (matches .page's --bg) rather than transparent: an alpha
 * channel forces Chrome's PDF print pipeline to embed a second same-size
 * soft-mask image alongside the color image, roughly doubling this asset's
 * PDF size for no visible benefit, since the report's page background is
 * this same solid color everywhere the starfield sits. Writes
 * src/lib/starfield.ts. */
import puppeteer from "puppeteer";
import { existsSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(__dirname, "..");
try {
  process.loadEnvFile(path.join(ROOT, ".env.local"));
} catch {
  /* ignore */
}
const exe = process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
if (!existsSync(exe)) throw new Error(`Chrome not found at ${exe}`);

// The original two-layer radial-gradient starfield, isolated.
const STAR_GRADIENTS =
  "radial-gradient(1.2px 1.2px at 20% 30%, rgba(255,255,255,0.8), transparent),radial-gradient(1px 1px at 75% 18%, rgba(255,255,255,0.6), transparent),radial-gradient(1.4px 1.4px at 40% 70%, rgba(255,255,255,0.7), transparent),radial-gradient(1px 1px at 88% 60%, rgba(255,255,255,0.5), transparent),radial-gradient(1.1px 1.1px at 12% 80%, rgba(255,255,255,0.6), transparent),radial-gradient(1px 1px at 60% 45%, rgba(255,255,255,0.45), transparent),radial-gradient(1.3px 1.3px at 30% 12%, rgba(201,168,76,0.7), transparent),radial-gradient(1px 1px at 92% 35%, rgba(201,168,76,0.5), transparent),radial-gradient(1px 1px at 8% 50%, rgba(255,255,255,0.5), transparent),radial-gradient(1.2px 1.2px at 55% 88%, rgba(255,255,255,0.55), transparent)";

const HTML = `<!doctype html><html><head><meta charset="utf-8"/><style>
  html,body{margin:0;background:#0D0D12;}
  .wrap{position:relative;width:794px;height:1123px;overflow:hidden;background:#0D0D12;}
  .stars{position:absolute;inset:0;}
  .stars::before,.stars::after{content:"";position:absolute;inset:0;background-image:${STAR_GRADIENTS};background-repeat:no-repeat;}
  .stars::after{transform:scale(1.7) rotate(8deg);opacity:0.5;}
</style></head><body><div class="wrap"><div class="stars"></div></div></body></html>`;

async function main() {
  const browser = await puppeteer.launch({
    executablePath: exe,
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--force-color-profile=srgb"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1.5 });
  await page.setContent(HTML, { waitUntil: "load" });
  const el = await page.$(".wrap");
  if (!el) throw new Error("no .wrap element found");
  const png = Buffer.from(await el.screenshot({ omitBackground: false, type: "png" }));
  await browser.close();

  const dataUri = "data:image/png;base64," + png.toString("base64");
  const file = path.join(ROOT, "src", "lib", "starfield.ts");
  await writeFile(
    file,
    `/**\n * Mystic Digits — baked starfield.\n *\n * A single pre-rendered, opaque PNG of the report's star layer (background\n * color baked in — see scripts/gen-starfield.ts for why opaque beats\n * transparent here). Replaces ~180 CSS radial-gradient "stars" per page\n * (which rendered as PDF shading patterns and made the PDF slow to open in\n * viewers). Visually identical; one image, reused on every page. Regenerate\n * with scripts/gen-starfield.ts if the star layer design changes.\n */\nexport const STARFIELD_DATA_URI =\n  "${dataUri}";\n`,
    "utf8",
  );
  console.log(`wrote ${file} — PNG ${(png.length / 1024).toFixed(0)} KB`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
