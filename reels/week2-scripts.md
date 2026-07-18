# Mystic Digits — Reel Scripts, Week 2 (13–19 July 2026)

**New style this week:** all four reels use the v3 dynamic renderer —
`npx tsx scripts/render-reel-dynamic.ts reels/specs/<spec>.json` — live starfield,
rising gold dust, rotating sacred-geometry ring, word-pop kinetic titles, zoom
transitions, and a giant gold hero digit on hook slides. Same brand, way more motion.

**Posting workflow (per reel):** upload MP4, add a trending audio at low volume in
the IG editor, paste caption + hashtags, reply to the first 10 comments fast,
cross-post to Facebook.

**CTA change (from 14 Jul):** ~91% of reel views come from Facebook, where "link in
bio" is a dead end — insights on 13 Jul's reel showed 1,193 views and 0 link clicks.
New rule: end slides and captions say **"comment your birth date"** instead of "link
in bio", and immediately after posting, pin a comment FROM the MysticDigits page
containing the clickable link `https://mysticdigits.in/order` (links work in FB
comments; on IG the bio link still applies). Reply to every birth-date comment with
one personal line + the link.

---

## Mon 13 Jul — "The missing number" (Educate)
`reels/specs/reel-05-missing-number.json` → `reels/out/reel-05-missing-number/`

**Caption:**
Every number missing from your date of birth is a life lesson waiting. Write out your full DOB, digit by digit — which of 1–9 never shows up? That's the Lo Shu Grid, a 3×3 map of your energies from Vedic tradition. Comment your missing number 👇 and we'll tell you what it means.
Full grid, decoded → link in the pinned comment. 📖

**Hashtags:** #loshugrid #numerology #vedicnumerology #missingnumbers #ankjyotish #numerologyindia #mysticdigits

**Engagement play:** reply to every comment with the one-line lesson for their missing number + "full grid at mysticdigits.in".

---

## Wed 15 Jul — "Number of the Week = 3" (Inspire, weekly template)
`reels/specs/reel-02-week-of-13-jul-2026.json` → `reels/out/reel-02-week-of-13-jul-2026/`

Math check (Monday 13-07-2026): 1+3+0+7+2+0+2+6 = **21** → 2+1 = **3** (Jupiter). ✓ verified

**Caption:** This week carries the number 3 — Jupiter energy. Growth, wisdom and generosity are favoured; the big-picture move you've been postponing wants to happen now. Best day: Thursday. Wear yellow. Mulank 3? The week belongs to you. ✨
**Hashtags:** #weeklyenergy #numerology #jupiter #guru #vedicastrology #mysticdigits #weeklyforecast

---

## Fri 17 Jul — "2026 is a different number for YOU" (Convert)
`reels/specs/reel-06-personal-year.json` → `reels/out/reel-06-personal-year/`

Personal Year = birth day + birth month + current year, reduced.
Example in reel: 28 Jan → 2+8+0+1+2+0+2+6 = 21 → **3**. ✓ verified

**Caption:**
2026 isn't the same year for everyone. Add your birth DAY + MONTH + 2026 and reduce to one digit — that's your Personal Year number, and it sets the theme of your next 12 months. New beginnings? Money moves? Endings? Comment your number 👇
Your full year, decoded month-by-month, is in the ₹99 report → link in the pinned comment. 📖✨

**Hashtags:** #personalyear #numerology #vedicnumerology #2026forecast #yearahead #numerologyreport #mysticdigits

**Engagement play:** every comment gets their year-number theme + a nudge to the report. This is the conversion reel — pin the best comment asking "how do I get the full report?"

---

## Sat 18 Jul — "Your lucky day" (Entertain) ✅ PRODUCED
New animated style (static slides + purple countdown both retired):
`npx tsx scripts/render-reel-frames.ts reels/scenes/reel-07-lucky-day.html` → `reels/out/reel-07-lucky-day/`
Aurora night-sky, persistent 7-day week strip that roulette-scans then lights up
gold as each Mulank group claims its day, kinetic word-pop titles.

Day mapping matches the paid report engine (src/lib/mulank-content.ts):
1→Sun, 2→Mon, 3→Thu, 4→Sat, 5→Wed, 6→Fri, 7→Mon, 8→Sat, 9→Tue.

**Caption:** One day of the week carries YOUR number's energy — the day to sign, launch, propose, or ask. Check your birth day above. Planning something big? Comment your lucky day 👇 and tag someone who needs to reschedule their plans. 😄
**Hashtags:** #luckyday #numerology #vedicnumerology #ankjyotish #funfacts #astrologyindia #mysticdigits

---

## Cadence (unchanged)
- **Mon** Educate · **Wed** Inspire (weekly number — the workhorse) · **Fri** Convert · **Sat** Entertain
- Next week's number (Mon 20-07-2026): 2+0+0+7+2+0+2+6 = 19 → 1+9 = 10 → **1** (Sun) — double-check before rendering.
