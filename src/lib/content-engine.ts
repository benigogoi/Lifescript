/**
 * Mystic Digits — Claude content engine.
 *
 * Hybrid generation: the static knowledge base (report-data.ts) supplies the
 * full narrative backbone for free — essences, lists, year predictions, lucky
 * elements, remedies, the thank-you message. The single Claude call writes
 * the one thing a knowledge base can't: 8 paragraphs tying each static
 * section to THIS person's specific combination — Mulank, Bhagyank, Name
 * Number, the Lo Shu Grid page (using the active Lo Shu Arrows computed by
 * activeLoShuLines in numerology.ts as the hook), the two Year Ahead pages
 * (the displayed digit is the Universal Year, same for everyone; a
 * deterministic Mulank-vs-Universal-Year tier badge — see yearFavourability
 * in report-data.ts — is shown alongside it, and the AI paragraph must agree
 * with that tier rather than always spinning positive), and the Lucky
 * Elements/Remedies pages (which stay factually fixed by Mulank planet; only
 * the "why this matters for you" framing is personalised). Each AI paragraph
 * is inserted right after the page's static opening paragraph rather than
 * appended last, so it reads as integrated, not a postscript.
 * That's roughly 3000-3500 output
 * tokens (~₹4.5-5/report at current pricing) instead of regenerating the
 * entire report (~10,600 tokens), keeping per-report API cost a fraction of
 * the ₹99 price while making the most personally-resonant parts of the
 * report unique to each customer.
 *
 * Model: claude-sonnet-4-6 (per the project brief — good cost/quality balance
 * for the ₹99 product). Requires ANTHROPIC_API_KEY in the environment.
 */
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { calculateNumerology, reduceToSingleDigit, PLANET_BY_NUMBER, activeLoShuLines } from "./numerology";
import { staticContent } from "./report-template";
import { LUCKY, REMEDIES, yearFavourability, LO_SHU_ARROWS } from "./report-data";
import type { ReportOptions, ResolvedContent } from "./report-template";

const MODEL = "claude-sonnet-4-6";

const comboSchema = z.object({
  mulankCombo: z.string().describe(
    "4-6 sentences (~120-160 words), a complete standalone paragraph (capitalised, NOT a continuation clause) genuinely synthesising how this person's Mulank combines with their Bhagyank, Name Number AND Lo Shu pattern (repeated/missing digits, active Lo Shu Arrows) — the personality angle. Use the room to develop one real thread in depth rather than listing several shallow observations.",
  ),
  bhagyankCombo: z.string().describe(
    "4-6 sentences (~120-160 words), a complete standalone paragraph genuinely synthesising how this person's Bhagyank combines with their Mulank, Name Number and Lo Shu pattern — the destiny/life-path angle. Develop one real thread in depth.",
  ),
  nameCombo: z.string().describe(
    "4-6 sentences (~120-160 words), a complete standalone paragraph genuinely synthesising how this person's Name Number combines with their Mulank, Bhagyank and Lo Shu pattern — how others perceive them given that combination. Develop one real thread in depth.",
  ),
  loshuCombo: z.string().describe(
    "Keep it TIGHT: 2-3 sentences, no more than ~65 words — this is the only content on the page's lower half (replacing the static arrow listing entirely) and the page has the least spare vertical space of any in the report, so longer text gets clipped even after the font auto-shrinks to its floor. loShuArrows in the payload lists the classical Lo Shu Arrows (named lines through the 3x3 grid) this person's chart actually completes, if any. If the list is non-empty, name the arrow(s) by name and tie what they represent to this person's Mulank/Bhagyank/Name — make it feel like a discovery, not a restatement of the strong/missing digit lists already on the page. If the list is empty, frame the absence positively: energy concentrated in fewer numbers rather than spread thin, and tie that concentration to their Mulank/Bhagyank/Name instead.",
  ),
  year1Combo: z.string().describe(
    "3 sentences (~75-85 words) — this page has a font auto-shrink safety net but stay disciplined. universalYear1 in the payload is the year's energy shared by EVERYONE (e.g. 2026 reduces to 1) — it is NOT personal to this customer. universalYear1.tier is a deterministic rating (Highly Favourable / Favourable / Steady / Challenging) of how this year sits with THIS person's Mulank, already shown to the reader as a badge on the page — your paragraph must agree with it, not soften or override it. If tier is Highly Favourable or Favourable, name the resonance/support plainly and lean into the momentum. If Steady, say progress this year depends more on the person's own effort than on cosmic tailwind. If Challenging, be honest that the year asks real friction or extra patience — frame it constructively (what to focus on or protect) without pretending it's secretly easy. Concrete, never a generic restatement of what the year number means.",
  ),
  year2Combo: z.string().describe(
    "Same idea and length as year1Combo (3 sentences, ~75-85 words), but for universalYear2 and its own tier — and briefly note how the energy shifts or builds from universalYear1 to universalYear2 for this specific person.",
  ),
  luckyCombo: z.string().describe(
    "3-4 sentences (~70-90 words). The lucky days/colours/numbers/gemstone/metal/direction in the payload are fixed facts determined by this person's Mulank planet — do NOT invent different ones. Your job is to explain, concretely, how/when THIS specific person (given their Bhagyank/Name Number/Lo Shu) gets the most out of one or two of these specific lucky elements — not a generic 'these bring you luck' restatement. The page also shows a deterministic Bhagyank Bonus line (a second lucky day/colour from their Bhagyank planet) — you may nod to how the two work together, but don't just restate it.",
  ),
  remedyCombo: z.string().describe(
    "1-2 sentences, no more than ~45 words — this page already has 5 remedy items, a mantra box, and a Bhagyank Bonus line, so there is very little spare room. The mantra and remedy practices in the payload are fixed, determined by this person's Mulank planet — do NOT invent different ones. Name the ONE practice that matters most for THIS person given their fuller chart (e.g. a tension or growth edge from their Bhagyank/Name/Lo Shu that it directly addresses) — not a generic restatement.",
  ),
});

const SYSTEM = `You are the master numerologist behind Mystic Digits, an Indian/Vedic numerology service. The report's core narrative is already written from a static knowledge base — your only job is to add the one thing a static page can't: how THIS person's specific combination of numbers interacts.

VOICE & RULES (critical):
- Warm, empowering, and rooted in Indian cultural context. Address the reader as "you".
- Plain, beautiful English (no Hindi yet). No jargon dumps.
- NEVER harsh, fatalistic, or cursing. Never predict misfortune. Frame every tension as growth.
- Use the Indian planetary rulers: 1=Sun(Surya), 2=Moon(Chandra), 3=Jupiter(Brihaspati), 4=Rahu, 5=Mercury(Budh), 6=Venus(Shukra), 7=Ketu, 8=Saturn(Shani), 9=Mars(Mangal).
- Write all eight paragraphs as if a different person drafted each one. Each must open differently — do not lean on a stock transition like "What makes this particularly distinctive/striking is..." or "To the outside world..." more than once across the whole set. Vary sentence length and which number you name first.

TASK:
Write one paragraph each for Mulank, Bhagyank, and Name Number. Each paragraph must be about the COMBINATION, not the number alone — name what's distinctive about how these specific numbers sit together for this person (agreement, tension, or balance), and resolve any tension gracefully rather than contradicting yourself. Vary the angle per paragraph as described in the schema so the three don't just repeat each other. If Lo Shu has no missing or repeated digits, build the combination from the three core numbers alone.

Then write loshuCombo for the Lo Shu Grid page, per the schema's instructions — using loShuArrows from the payload (the named classical lines this person's chart actually completes, if any) as the hook, since that's the one fact on this page no other paragraph already covers.

Then write one paragraph each for the two Year Ahead pages (year1Combo, year2Combo). Each year has a Universal Year number that is the SAME for everyone (2026 reduces to 1, 2027 reduces to 2 — given as universalYear1/universalYear2 in the payload). The report already has generic, static copy for what that universal number means in the abstract; your job is the part the static copy can't do — read that universal year against THIS person's own Mulank. Each universalYear also carries a "tier" (Highly Favourable / Favourable / Steady / Challenging) — a fixed rating, already computed and shown to the reader as a small badge, of how that year's planetary energy actually sits with this person's Mulank. Your paragraph must be honest and consistent with that tier, not uniformly upbeat: lean into the momentum when it's Highly Favourable or Favourable, say progress depends more on personal effort than on cosmic support when Steady, and openly name the friction when Challenging (while still framing it constructively per the voice rules — never fatalistic, never claim it's secretly easy). Never contradict the tier shown on the page.

Finally, write one paragraph each for luckyCombo and remedyCombo, per the schema's instructions. These pages list fixed correspondences (lucky colours, gemstone, mantra, etc.) determined purely by the person's Mulank planet — never contradict or replace those facts. Your paragraph adds the personalised "why this matters for you specifically" layer on top.`;

/** Build the prompt payload describing this customer's computed numerology. */
function describe(opts: ReportOptions, year1: number, year2: number) {
  const r = calculateNumerology(opts);
  const uy1 = reduceToSingleDigit(year1);
  const uy2 = reduceToSingleDigit(year2);
  const lucky = LUCKY[r.mulank.number];
  const rem = REMEDIES[r.mulank.number];
  return {
    fullName: r.input.fullName,
    firstName: r.input.firstName,
    dateOfBirth: `${r.input.day}-${r.input.month}-${r.input.year}`,
    mulank: { number: r.mulank.number, planet: r.mulank.planet },
    bhagyank: { number: r.bhagyank.number, planet: r.bhagyank.planet },
    nameNumber: { number: r.nameNumber.number, planet: r.nameNumber.planet },
    loShu: {
      counts: r.loShu.counts,
      missing: r.loShu.missing,
      repeated: r.loShu.repeated,
    },
    loShuArrows: activeLoShuLines(r.loShu.counts).map((line) => LO_SHU_ARROWS[line.id].name),
    universalYear1: { year: year1, number: uy1, planet: PLANET_BY_NUMBER[uy1], tier: yearFavourability(r.mulank.number, uy1) },
    universalYear2: { year: year2, number: uy2, planet: PLANET_BY_NUMBER[uy2], tier: yearFavourability(r.mulank.number, uy2) },
    luckyElements: {
      days: lucky.days,
      colors: lucky.colors.map((c) => c.name),
      numbers: lucky.numbers,
      gemstone: lucky.gemstone,
      metal: lucky.metal,
      direction: lucky.direction,
    },
    remedies: { mantra: rem.mantra, practices: rem.items.map((it) => it.title) },
  };
}

export interface GenerateOptions {
  client?: Anthropic;
}

export interface GeneratedContent {
  content: ResolvedContent;
  /** Claude API cost for this generation call, in USD. */
  costUsd: number;
}

/**
 * Generate the personalised report content for a customer: the static
 * knowledge base for everything, plus a Claude-written combination insight
 * for mulank/bhagyank/name. Throws on API/validation error — callers should
 * fall back to plain staticContent().
 */
export async function generateReportContent(
  opts: ReportOptions,
  gen: GenerateOptions = {},
): Promise<GeneratedContent> {
  const client = gen.client ?? new Anthropic();
  const year1 = opts.year1 ?? (opts.preparedDate ?? new Date()).getFullYear();
  const year2 = opts.year2 ?? year1 + 1;

  const r = calculateNumerology(opts);
  const base = staticContent(r, year1, year2);
  const payload = describe(opts, year1, year2);

  const response = await client.messages.parse({
    model: MODEL,
    max_tokens: 3000,
    thinking: { type: "disabled" },
    output_config: { effort: "medium", format: zodOutputFormat(comboSchema) },
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content:
          `Write the personalised combination insight for this Mystic Digits customer.\n\n` +
          `Computed numerology:\n${JSON.stringify(payload, null, 2)}`,
      },
    ],
  });

  const parsed = response.parsed_output;
  if (!parsed) {
    throw new Error(`Content generation failed (stop_reason: ${response.stop_reason})`);
  }

  const { input_tokens, output_tokens } = response.usage;
  const costUsd = (input_tokens * 3 + output_tokens * 15) / 1_000_000;
  console.log(
    `Claude usage: ${input_tokens} in / ${output_tokens} out tokens → ~$${costUsd.toFixed(4)} (${MODEL} pricing)`,
  );

  // The AI paragraph is inserted right after the opening paragraph (index 1),
  // not appended last, so personalisation reads as integrated rather than a
  // postscript tacked onto the static lead-in.
  const insertAfterLead = (paras: string[], combo: string) => [paras[0], combo, ...paras.slice(1)];

  return {
    costUsd,
    content: {
      ...base,
      mulank: { ...base.mulank, paras: insertAfterLead(base.mulank.paras, parsed.mulankCombo) },
      bhagyank: { ...base.bhagyank, paras: insertAfterLead(base.bhagyank.paras, parsed.bhagyankCombo) },
      name: { ...base.name, paras: insertAfterLead(base.name.paras, parsed.nameCombo) },
      loshu: { ...base.loshu, combo: parsed.loshuCombo },
      year1: { ...base.year1, paras: insertAfterLead(base.year1.paras, parsed.year1Combo) },
      year2: { ...base.year2, paras: insertAfterLead(base.year2.paras, parsed.year2Combo) },
      lucky: { combo: parsed.luckyCombo },
      remedy: { combo: parsed.remedyCombo },
    },
  };
}
