# Reels

30 faceless reels for Instagram, one a day from 9 Oct to 7 Nov 2026. The posting
plan (captions, hashtags, comment to pin, tracked DM link per day) is in
[`CALENDAR.md`](CALENDAR.md).

## Render

```
npx tsx scripts/render-reel.ts --all                       # every spec → MP4
npx tsx scripts/render-reel.ts reels/specs/r01-dhoni-seven.json
npx tsx scripts/render-reel.ts --all --stills-only         # one still per scene, in seconds, for review
```

Output goes to `reels/out/<slug>/`: `<slug>.mp4` (1080×1920, 30 fps, H.264, with a
silent audio track) and `cover.jpg` (the hook frame). Needs Chrome (set `CHROME_PATH`
if it isn't in the default place) and ffmpeg on PATH. A 20-second reel takes about
two minutes. `--concurrency=N` renders N at once, each in its own browser.

The renderer (`scripts/render-reel.ts` + `scripts/reel/`) animates every frame as a
pure function of time, so the same spec always gives the same video.

## Spec format

```jsonc
{
  "slug": "r09-mulank-8-saturn",
  "accent": "#3c5fb0",            // glow colour; each Mulank reel uses its planet's
  "scenes": [
    { "type": "hook", "text": "Born on the *8th*, *17th* or *26th*?", "sub": "Here's why life tests you harder." },
    { "type": "point", "n": 1, "of": 3, "text": "Nothing comes *easy*\nto you. Nothing." },
    { "type": "big", "value": "8", "caption": "The number of *late, lasting* success." },
    { "type": "end", "text": "Comment *8* if this\nis your life", "sub": "Saturday is your day." }
  ]
}
```

`*word*` turns gold, `\n` breaks the line, and a non-breaking space (` `) keeps
two words together. Durations are computed from word count; set `"dur"` to override.

| Type    | What it does                                                                      |
|---------|-----------------------------------------------------------------------------------|
| `hook`  | Fully legible on frame 0 (it is the frame that stops the scroll, and the cover)   |
| `text`  | Headline revealed word by word, optional `sub` line                               |
| `point` | A numbered beat with a `2 / 3` counter, so viewers wait for the last one          |
| `big`   | One giant number with a burst, then a `caption`                                   |
| `calc`  | Digits adding up on screen: `"steps": ["28", "2 + 8", "10", "1"]`                 |
| `rapid` | `items` flash too fast to read, so viewers pause and replay (optional `color`)    |
| `image` | A report page from `public/samples/` with a slow push-in (`focus` sets the point) |
| `end`   | Logo, call to action, `mysticdigits.in` pill (`"url": false` hides it)            |

## What makes these hold attention

- **The hook is frame 0.** No fade-in, no logo first. A call-out ("Born on the 8th,
  17th or 26th?"), a contradiction ("Your lucky number is probably wrong") or an open
  question ("Why did Ajay Devgan drop the 'a'?").
- **An open loop in the first 3 seconds.** "Wait for #3", a `1 / 3` counter, a
  calculation that hasn't landed yet.
- **A payoff every 2–3 seconds.** New words, a number landing, a page turning.
  Something moves on every frame (stars, camera push, glow).
- **15–24 seconds.** Completion rate decides reach more than length does.
- **Endings that ask for a share, a comment or a save,** not a follow: "Send this
  to a 9", "Comment your birth date", "Save this for January". Sends to friends are
  the strongest signal for reaching new people.
- **Rewatch mechanics.** The `rapid` pause games can't be read in one pass, so
  every viewer replays them.

## Adding the next batch

Copy a spec that performed well, change the number, angle or celebrity, and
render. Name it with the next code (`r31-…`) and give its DM link
`utm_campaign=r31` so orders trace back to it in the admin dashboard.
