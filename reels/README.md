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
  "style": "planet",              // the look: see "Looks" below (default "night")
  "planet": "saturn",             // planet look only: sun | moon | jupiter | saturn | mars
  "accent": "#f3d98f",            // highlight / glow colour
  "scenes": [
    { "type": "hook", "text": "Born on the *8th*, *17th* or *26th*?", "sub": "Here's why life tests you harder." },
    { "type": "point", "n": 1, "of": 3, "text": "Nothing comes *easy*\nto you. Nothing." },
    { "type": "big", "value": "8", "caption": "The number of *late, lasting* success." },
    { "type": "end", "text": "Comment *8* if this\nis your life", "sub": "Saturday is your day." }
  ]
}
```

`*word*` highlights, `~word~` strikes through (drawn in red pen in the notebook look),
`\n` breaks the line, and a non-breaking space (` `) keeps
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
| `chat`  | A whole conversation: `"banner"` hook, then `"messages"` (`{"me": true, "text"}` for the asker, `{"text"}` for replies, `{"num", "text"}` for a number card). Replies show typing dots first |
| `end`   | Logo, call to action, `mysticdigits.in` pill (`"url": false` hides it)            |

## Looks

Six looks, so the profile grid never turns into one repeated template. Each look
gets at most 5 reels in a 30-day set, and never two days running (the generator
checks both). Pick the look that fits the content:

| `style`    | Feels like                                                        | Best for                         |
|------------|-------------------------------------------------------------------|----------------------------------|
| `night`    | Black, gold serif, starfield, mandala (the brand's own look)       | Product reels, pause games       |
| `paper`    | Panchang almanac page: ivory, vermilion border, marigold petals   | Festivals, traditions, the year  |
| `notebook` | Ruled school notebook: blue-ink handwriting, red-pen circles      | Anything you calculate or spell  |
| `bold`     | Full-screen colour blocks wiping over each other, huge capitals   | Punchy call-outs, colour reels   |
| `planet`   | Deep space above the ruling planet's glowing horizon              | Mulank reels (one per planet)    |
| `chat`     | A messaging thread with typing dots                               | Q&A stories, "POV" hooks         |

`bold` takes `"paletteStart"` (0–5) to choose its first colour block; a `rapid`
item's `color` floods the whole screen in that look. `planet` takes `"sky": "sun"`
to put a sun above the horizon.

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
