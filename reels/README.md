# Reels — how to make one

## Animated scenes (current style)

```
npx tsx scripts/render-reel-frames.ts reels/scenes/<scene>.html
```

Each scene is a self-contained HTML file exposing `window.seekMs(t)` +
`window.TOTAL_MS` — every visual is a pure function of t, so the renderer
captures deterministic frames through headless Chrome and pipes them straight
into ffmpeg (nothing hits disk except the MP4 and a few `preview-*s.png`
stills). Fonts are vendored in `reels/fonts/` so no network is needed.
First scene: `reels/scenes/reel-07-lucky-day.html` — copy it as a starting
point. Requires ffmpeg on PATH; set CHROME_PATH if Chrome isn't in the
default spot (e.g. `CHROME_PATH=/opt/pw-browsers/chromium` in sandboxes).

## Static slide decks (v1 style — retired, kept for reference)

```
npx tsx scripts/render-reel.ts reels/specs/<your-spec>.json
```

Output lands in `reels/out/<slug>/` — numbered PNG slides plus `<slug>.mp4`
(silent on purpose: add a trending audio in the Instagram editor for reach).

Requires: system Chrome (default path baked in, override with CHROME_PATH)
and ffmpeg on PATH (installed via winget on the main PC). Without ffmpeg you
still get the PNGs — Instagram can build a reel from photos directly.

## Spec format

```jsonc
{
  "slug": "reel-02-example",        // output folder + mp4 name
  "slides": [
    {
      "kind": "text",               // "text" (default) | "list" | "end"
      "eyebrow": "VEDIC NUMEROLOGY",// small gold caps line (optional)
      "title": "The big hook line", // main Cormorant headline
      "body": "Supporting line.",   // muted Jost paragraph (optional)
      "durationSec": 2.5            // how long this slide stays on screen
    },
    {
      "kind": "list",               // bullet-free centered list
      "title": "The nine numbers",
      "items": ["1 · Sun — the Leader", "2 · Moon — the Intuitive"],
      "durationSec": 4.5
    },
    {
      "kind": "end",                // logo + CTA end card
      "title": "Find your full reading",
      "body": "mysticdigits.in · free calculator",
      "durationSec": 2.8
    }
  ]
}
```

Rules of thumb:
- 6-7 slides, 16-22 seconds total. Hook slide first, end card last.
- ~2.2s for short lines, ~3s for lines people must read, ~4.5s for lists.
- Keep titles under ~6 words; they render at 108px.
- Scripts + captions + hashtags for the first five reels: `week1-scripts.md`.
