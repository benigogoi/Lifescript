/**
 * Claude content for the 27-page test report.
 *
 * Same hybrid model as content-engine.ts: every number, table and fixed
 * correspondence is computed or static, and ONE Claude call writes the
 * personal paragraphs for each page.
 *
 * Hard cost cap: before the call, input tokens are counted (plus a margin for
 * the output-format schema), and max_tokens is set to whatever is left of the
 * ₹ budget — so even a response that runs to the limit cannot cost more than
 * COST_CAP_INR, at a deliberately pessimistic rupee rate.
 */
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { calculateNumerology, reduceToSingleDigit, PLANET_BY_NUMBER, activeLoShuLines, LO_SHU_LINES, type Digit } from "../numerology";
import { LUCKY, REMEDIES, YEAR_CORE, LO_SHU_ARROWS, NUMBER_CORE, yearFavourability } from "../report-data";
import { MULANK_CONTENT } from "../mulank-content";
import { BHAGYANK_CONTENT } from "../bhagyank-content";
import type { ReportOptions } from "../report-template";
import { MONEY, PERSONAL_MONTH, BODY_AREAS, COMPOUND, TIER_LABEL } from "./data";
import { assessName, suggestSpellings, personalYear, nextMonths, missingFilledByName, VERDICT_LABEL, MONTH_NAMES } from "./calc";

export const REPORT27_MODEL = "claude-sonnet-4-6";
const USD_PER_INPUT_TOKEN = 3 / 1_000_000;
const USD_PER_OUTPUT_TOKEN = 15 / 1_000_000;
/** Pessimistic on purpose, so the rupee cap holds even if the rupee weakens. */
export const INR_PER_USD = 95;
export const COST_CAP_INR = 15;

export const report27Schema = z.object({
  welcome: z.string().describe("70-90 words. A warm welcome to this person's report that names their Mulank and Bhagyank and the single most striking thing about their chart. Start with a letter, not a digit."),
  mulankCombo: z.string().describe("150-180 words, a complete standalone paragraph that gets its own page: how this person's Mulank combines with their Bhagyank, Name Number and Lo Shu pattern — the personality angle. Develop one or two real threads in depth, with a concrete everyday example. Start with a letter."),
  bhagyankCombo: z.string().describe("90-115 words, a complete standalone paragraph: how their Bhagyank combines with their Mulank, Name Number and Lo Shu pattern — the destiny / life-path angle. Stay within the limit; this page has little spare room."),
  nameCombo: z.string().describe("90-115 words, a complete standalone paragraph: how their first-name Name Number combines with Mulank, Bhagyank and Lo Shu — how others perceive them. Stay within the limit; this page has little spare room."),
  together: z.string().describe("120-150 words on the three relationships in numberRelationships: where the numbers agree, where they pull apart, and how this person can use the tension. Start with a letter."),
  nameVerdict: z.string().describe("90-120 words explaining fullNameReading honestly: what the compound vibration means for them, how the name number sits with their Mulank and Bhagyank, and the verdict. If not aligned, spelling changes are optional and gentle — never urgent, never a legal requirement. Start with a letter."),
  loshuCombo: z.string().describe("2-3 sentences, max 60 words. Tie their completed and forming planes to their Mulank/Bhagyank as a discovery. Do not restate the digit lists."),
  planes: z.string().describe("70-90 words on what their complete and forming planes say together, naming one or two planes by name."),
  missing: z.string().describe("60-80 words on how their specific missing numbers show up in daily life and which one to work on first. If none are missing, celebrate the complete grid."),
  repeated: z.string().describe("80-100 words on how their repeated numbers (with counts) intensify their personality, framed constructively. If none repeat, speak to balance."),
  career: z.string().describe("110-140 words: the work where this person's Mulank and Bhagyank meet, drawing on the career lists in the payload, ending with one concrete step for the next year."),
  money: z.string().describe("110-140 words: their money pattern given Mulank, Bhagyank and Lo Shu, consistent with the do/avoid lists. No specific investments or products, no promises of wealth."),
  love: z.string().describe("110-140 words: what this person needs and gives in love, and one pattern to watch, drawing on Mulank, Bhagyank and Name Number."),
  compatibility: z.string().describe("70-90 words on who they naturally match with and how to handle the numbers that need more understanding, using the lists in the payload. These are OTHER people's Mulank numbers: name each only by the planet given beside it in the payload, and never bring this person's own Bhagyank or Name Number planets into these pairings."),
  health: z.string().describe("80-100 words of general wellbeing guidance tied to the planets and body areas in the payload. Lifestyle only — no diagnoses, cures, supplements or medical claims."),
  year1Combo: z.string().describe("60-75 words reading universalYear1 against THIS person's Mulank. Must agree with universalYear1.tier: lean in when favourable, name effort when steady, honestly name friction (constructively) when challenging."),
  year2Combo: z.string().describe("60-75 words, same rules for universalYear2 and its tier, noting how the energy shifts from year 1 to year 2 for them."),
  personalYear: z.string().describe("100-120 words contrasting their Personal Years (personalYear1, personalYear2) with the Universal Years, and what the shift from one to the next asks of them. Start with a letter."),
  months: z
    .array(
      z.object({
        theme: z.string().describe("3-6 word title for this month, in the spirit of its personal month theme"),
        focus: z.string().describe("45-60 words on what to focus on this month, specific to this person and consistent with its personal month number"),
      }),
    )
    .length(3)
    .describe("One entry per month in nextMonths, in the same order."),
  luckyCombo: z.string().describe("60-80 words. The lucky elements in the payload are fixed — never invent others. Explain concretely how and when THIS person gets the most from one or two of them."),
  remedyCombo: z.string().describe("1-2 sentences, max 45 words. Name the ONE practice from the fixed remedies that matters most for this person's fuller chart, and why."),
  actions: z
    .array(
      z.object({
        title: z.string().describe("3-7 words, an imperative"),
        detail: z.string().describe("25-35 words, concrete, tied to a specific number or finding in their report"),
      }),
    )
    .length(5)
    .describe("Five personal action steps, ordered by what to do first."),
  thankyou: z.string().describe("45-60 words, a warm closing blessing naming their ruling planets."),
});

export type Report27Content = z.infer<typeof report27Schema>;

const SYSTEM_27 = `You are the master numerologist behind Mystic Digits, an Indian/Vedic numerology service, writing the personal paragraphs of a 27-page report. Every number, table and fixed correspondence on each page is already computed and printed. Your job is the part static copy can't do: read THIS person's specific combination of numbers, page by page.

VOICE & RULES (critical):
- Warm, empowering and rooted in Indian cultural context. Address the reader as "you". Plain, beautiful English with Indian/British spelling.
- NEVER harsh, fatalistic or fear-based. Never predict misfortune, illness, death, divorce or financial ruin. Frame every tension as growth.
- Indian planetary rulers: 1=Sun (Surya), 2=Moon (Chandra), 3=Jupiter (Brihaspati), 4=Rahu, 5=Mercury (Budh), 6=Venus (Shukra), 7=Ketu, 8=Saturn (Shani), 9=Mars (Mangal).
- Every fact in the payload is FIXED: numbers, planets, tiers, relationship labels, verdicts, planes, lucky elements, remedies, personal year and month numbers. Never recompute, contradict or invent alternatives.
- Health is lifestyle and wellbeing only. Money never names specific investments or promises outcomes.
- Name spelling changes are always optional; never say anyone must change their legal name. If fullNameReading.alignedSpellingOptions is empty, don't mention alternative spellings at all — say their name can be strengthened exactly as it is (the next page shows how).
- Never refer the reader to another numerologist, astrologer, consultation or service.
- staticPageCopy is already printed on the Mulank, Bhagyank and Name Number pages, and mulankCombo, bhagyankCombo and nameCombo sit beside it. Agree with how it characterises each number — deepen it, never contradict it (if the page calls a name dependable, don't call it unpredictable).
- The Lo Shu grid comes from the birth date only. When a missing digit appears in loShu.missingFilledByName, the person's name supplies that number — traditionally the name fills the gap. Describe it as supported through their name, never as a weakness, lack or "evolving" quality.
- Each paragraph must add something the others don't. Don't repeat the same advice, example or phrase across sections, and vary how paragraphs open.
- Never start a paragraph with a digit (pages use a decorative drop-cap).
- Respect every length limit strictly: pages have fixed heights and overlong text is clipped.`;

const tier = (a: Digit, b: Digit) => TIER_LABEL[yearFavourability(a, b)];
const DIGITS: Digit[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

/** Everything Claude needs, all computed — the model only writes prose around these facts. */
export function describeReport27(opts: ReportOptions, now: Date) {
  const year1 = opts.year1 ?? now.getFullYear();
  const year2 = opts.year2 ?? year1 + 1;
  const r = calculateNumerology(opts);
  const m = r.mulank.number;
  const b = r.bhagyank.number;
  const n = r.nameNumber.number;
  const full = assessName(r.input.fullName, m, b);
  const spellings = suggestSpellings(r.input.fullName, m, b, 3);
  const complete = activeLoShuLines(r.loShu.counts).map((l) => l.id);
  const uy1 = reduceToSingleDigit(year1);
  const uy2 = reduceToSingleDigit(year2);
  const py1 = personalYear(r.input.day, r.input.month, year1);
  const py2 = personalYear(r.input.day, r.input.month, year2);
  const lucky = LUCKY[m];
  const rem = REMEDIES[m];

  return {
    fullName: r.input.fullName,
    firstName: r.input.firstName,
    dateOfBirth: `${r.input.day}-${r.input.month}-${r.input.year}`,
    preparedIn: `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`,
    mulank: { number: m, planet: r.mulank.planet },
    bhagyank: { number: b, planet: r.bhagyank.planet },
    nameNumber: { number: n, planet: r.nameNumber.planet, from: `first name "${r.input.firstName}"` },
    numberRelationships: {
      mulankAndBhagyank: tier(m, b),
      mulankAndNameNumber: tier(m, n),
      bhagyankAndNameNumber: tier(b, n),
    },
    fullNameReading: {
      name: full.full,
      letterTotal: full.total,
      compound: full.compound,
      compoundName: full.compound ? COMPOUND[full.compound].name : null,
      compoundTone: full.tone,
      nameNumber: full.single,
      planet: PLANET_BY_NUMBER[full.single],
      withMulank: TIER_LABEL[full.withMulank],
      withBhagyank: TIER_LABEL[full.withBhagyank],
      verdict: VERDICT_LABEL[full.verdict],
      alignedSpellingOptions: spellings.map((s) => s.full),
    },
    loShu: {
      counts: r.loShu.counts,
      missing: r.loShu.missing,
      missingFilledByName: missingFilledByName(r.loShu.missing, n, full.single).map((f) => ({ digit: f.digit, filledBy: f.by })),
      repeated: r.loShu.repeated.map((d) => ({ digit: d, times: r.loShu.counts[d] })),
      completePlanes: complete.map((id) => LO_SHU_ARROWS[id].name),
      formingPlanes: LO_SHU_LINES.filter((l) => !complete.includes(l.id)).map((l) => ({
        plane: LO_SHU_ARROWS[l.id].name,
        missingDigits: l.digits.filter((d) => r.loShu.counts[d] === 0),
      })),
    },
    universalYear1: { year: year1, number: uy1, planet: PLANET_BY_NUMBER[uy1], tier: yearFavourability(m, uy1) },
    universalYear2: { year: year2, number: uy2, planet: PLANET_BY_NUMBER[uy2], tier: yearFavourability(m, uy2) },
    personalYear1: { year: year1, number: py1, theme: YEAR_CORE[py1].theme },
    personalYear2: { year: year2, number: py2, theme: YEAR_CORE[py2].theme },
    nextMonths: nextMonths(now, r.input.day, r.input.month).map((mo) => ({
      month: mo.label,
      personalMonth: mo.personalMonth,
      theme: PERSONAL_MONTH[mo.personalMonth].theme,
    })),
    career: { mulankCareers: MULANK_CONTENT[m].careers, bhagyankCareers: BHAGYANK_CONTENT[b].careers.slice(0, 4) },
    money: { do: MONEY[m].do, avoid: MONEY[m].avoid },
    compatibility: {
      harmonious: DIGITS.filter((d) => d !== m && ["Harmonious", "Supportive"].includes(tier(m, d))).map((d) => ({ mulank: d, planet: PLANET_BY_NUMBER[d] })),
      needsMoreUnderstanding: DIGITS.filter((d) => d !== m && tier(m, d) === "Needs care").map((d) => ({ mulank: d, planet: PLANET_BY_NUMBER[d] })),
    },
    staticPageCopy: {
      mulankPage: { essence: NUMBER_CORE[m].mulankEssence, paragraphs: NUMBER_CORE[m].mulankParas },
      bhagyankPage: { essence: NUMBER_CORE[b].bhagyankEssence, paragraphs: NUMBER_CORE[b].bhagyankParas },
      nameNumberPage: { essence: NUMBER_CORE[n].nameEssence, paragraphs: NUMBER_CORE[n].nameParas, gives: NUMBER_CORE[n].nameGives },
    },
    healthAreas: { [r.mulank.planet]: BODY_AREAS[r.mulank.planet], [r.bhagyank.planet]: BODY_AREAS[r.bhagyank.planet] },
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

export interface GeneratedReport27 {
  content: Report27Content;
  costUsd: number;
  costInr: number;
  inputTokens: number;
  outputTokens: number;
  maxTokens: number;
}

export async function generateReport27Content(opts: ReportOptions, client = new Anthropic()): Promise<GeneratedReport27> {
  const now = opts.preparedDate ?? new Date();
  const payload = describeReport27(opts, now);
  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content:
        `Write the personalised content for this Mystic Digits customer's 27-page report.\n\n` +
        `Computed numerology (every fact is fixed):\n${JSON.stringify(payload, null, 2)}`,
    },
  ];
  const format = zodOutputFormat(report27Schema);

  // The cap: count the prompt, add a generous margin for the output-format
  // schema, and give max_tokens only what's left of the rupee budget.
  const counted = await client.messages.countTokens({ model: REPORT27_MODEL, system: SYSTEM_27, messages });
  const inputBudget = counted.input_tokens + Math.ceil(JSON.stringify(format).length / 3) + 500;
  const capUsd = COST_CAP_INR / INR_PER_USD;
  const maxTokens = Math.min(12000, Math.floor((capUsd - inputBudget * USD_PER_INPUT_TOKEN) / USD_PER_OUTPUT_TOKEN));
  if (maxTokens < 6000) {
    throw new Error(`Prompt too large for the ₹${COST_CAP_INR} cap — only ${maxTokens} output tokens would remain.`);
  }

  const response = await client.messages.parse({
    model: REPORT27_MODEL,
    max_tokens: maxTokens,
    thinking: { type: "disabled" },
    output_config: { effort: "medium", format },
    system: SYSTEM_27,
    messages,
  });

  const { input_tokens, output_tokens } = response.usage;
  const costUsd = input_tokens * USD_PER_INPUT_TOKEN + output_tokens * USD_PER_OUTPUT_TOKEN;
  const costInr = costUsd * INR_PER_USD;

  if (!response.parsed_output) {
    throw new Error(`Generation failed (stop_reason: ${response.stop_reason}) after spending ~₹${costInr.toFixed(2)}.`);
  }

  return { content: response.parsed_output, costUsd, costInr, inputTokens: input_tokens, outputTokens: output_tokens, maxTokens };
}

const FILLER =
  "this placeholder stands in for the personalised paragraph Claude writes for this section and is sized to the upper word limit so every page layout can be checked before any API call is made";

function filler(words: number): string {
  const w = FILLER.split(" ");
  const text = Array.from({ length: words }, (_, i) => w[i % w.length]).join(" ");
  return `${text[0].toUpperCase()}${text.slice(1)}.`;
}

/** Worst-case-length stand-in text, for checking page fit without calling the API. */
export function placeholderReport27Content(): Report27Content {
  return {
    welcome: filler(90),
    mulankCombo: filler(180),
    bhagyankCombo: filler(115),
    nameCombo: filler(115),
    together: filler(150),
    nameVerdict: filler(120),
    loshuCombo: filler(60),
    planes: filler(90),
    missing: filler(80),
    repeated: filler(100),
    career: filler(140),
    money: filler(140),
    love: filler(140),
    compatibility: filler(90),
    health: filler(100),
    year1Combo: filler(75),
    year2Combo: filler(75),
    personalYear: filler(120),
    months: [0, 1, 2].map(() => ({ theme: "A Placeholder Month Theme", focus: filler(60) })),
    luckyCombo: filler(80),
    remedyCombo: filler(45),
    actions: [0, 1, 2, 3, 4].map(() => ({ title: "A placeholder action step title", detail: filler(35) })),
    thankyou: filler(60),
  };
}
