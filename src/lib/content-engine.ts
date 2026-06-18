/**
 * LifeScript — Claude content engine.
 *
 * Generates the unique per-customer narrative for a report in a single
 * structured call, so Claude sees every number together and can resolve
 * contradictions gracefully. Returns a ResolvedContent that drops straight
 * into buildReportHtml(opts, content).
 *
 * Model: claude-sonnet-4-6 (per the project brief — good cost/quality balance
 * for the ₹99 product). Requires ANTHROPIC_API_KEY in the environment.
 */
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import {
  calculateNumerology,
  reduceToSingleDigit,
  PLANET_BY_NUMBER,
} from "./numerology";
import type { ReportOptions, ResolvedContent } from "./report-template";

const MODEL = "claude-sonnet-4-6";

const four = z.array(z.string()).describe("exactly 4 short items");
const pair = z.array(z.string()).describe("exactly 2 paragraphs");

const yearSchema = z.object({
  theme: z.string().describe("page title, 3–5 words, e.g. 'A Year to Begin Again'"),
  essence: z.string().describe("one line; continues after '{year} ', e.g. 'reduces to 1 — a year of fresh starts.'"),
  paras: pair.describe("2 paragraphs; paras[0] continues after '{Name}, {year} ', so starts e.g. 'is a number 1 year for you…'"),
  opportunities: four,
  takeCare: four,
});

const contentSchema = z.object({
  mulank: z.object({
    essence: z.string().describe("one evocative line about this birth number"),
    paras: pair.describe("paras[0] continues after '{Name}, ' so starts lowercase, e.g. 'your Mulank is 1 — …'"),
    strengths: four,
    growth: four.describe("growth edges / lessons, phrased kindly"),
  }),
  bhagyank: z.object({
    essence: z.string(),
    paras: pair.describe("paras[0] continues after '{Name}, ' so starts lowercase, e.g. 'your Bhagyank is 6 — …'"),
    favours: four.describe("where destiny favours them"),
    asks: four.describe("what destiny asks of them"),
  }),
  name: z.object({
    essence: z.string(),
    paras: pair.describe("paras[0] continues after 'Your name \"{Name}\" ', e.g. 'vibrates to 5, ruled by Mercury…'"),
    gives: four.describe("what their name gives them"),
    useWisely: four.describe("how to use the name's energy wisely"),
  }),
  loshu: z.object({
    strongPlanes: four.describe("up to 4 short notes on repeated/present numbers and what they mean"),
    missingItems: z.array(z.string()).describe("one short note per missing number, what to cultivate"),
    missingTitle: z.string().describe("'Missing: 3 · 4 · 6 · 7' style, or 'A Complete Grid' if none missing"),
  }),
  year1: yearSchema,
  year2: yearSchema,
  thankyou: z.object({
    message: z.string().describe("a warm closing blessing, 2 sentences, no name (the page adds the name)"),
  }),
});

const SYSTEM = `You are the master numerologist behind LifeScript, an Indian/Vedic numerology service. You write the personalised narrative for a customer's report.

VOICE & RULES (critical):
- Warm, empowering, and rooted in Indian cultural context. Address the reader as "you".
- Plain, beautiful English (no Hindi yet). No jargon dumps.
- NEVER harsh, fatalistic, or cursing. Never say things like "you may cheat others" or predict misfortune. Frame every challenge as growth.
- The content MUST be unique to THIS person's specific combination of numbers. Weave the numbers together — where two numbers pull in different directions, acknowledge the tension and resolve it gracefully rather than contradicting yourself.
- Use the Indian planetary rulers: 1=Sun(Surya), 2=Moon(Chandra), 3=Jupiter(Brihaspati), 4=Rahu, 5=Mercury(Budh), 6=Venus(Shukra), 7=Ketu, 8=Saturn(Shani), 9=Mars(Mangal).

OUTPUT SHAPE (strict):
- Every "paras" field is EXACTLY 2 paragraphs (2–4 sentences each).
- "paras[0]" is a CONTINUATION clause — the report prepends the person's name, so it must read naturally after it. Mulank/Bhagyank start lowercase like "your Mulank is 1 — …". Name starts like "vibrates to 5, ruled by Mercury…". Year starts like "is a number 1 year for you…".
- strengths/growth/favours/asks/gives/useWisely/opportunities/takeCare are EXACTLY 4 short items each (a few words, not full sentences).
- loshu.missingItems: one short item per missing number. loshu.strongPlanes: up to 4 short notes on the numbers they DO have (especially repeated ones).
- Keep paragraph lengths similar to a polished printed report — substantial but not bloated.`;

/** Build the prompt payload describing this customer's computed numerology. */
function describe(opts: ReportOptions, year1: number, year2: number) {
  const r = calculateNumerology(opts);
  return {
    fullName: r.input.fullName,
    firstName: r.input.firstName,
    dateOfBirth: `${r.input.day}-${r.input.month}-${r.input.year}`,
    mulank: { number: r.mulank.number, planet: r.mulank.planet },
    bhagyank: { number: r.bhagyank.number, planet: r.bhagyank.planet },
    nameNumber: { number: r.nameNumber.number, planet: r.nameNumber.planet },
    universalYears: {
      [year1]: { number: reduceToSingleDigit(year1), planet: PLANET_BY_NUMBER[reduceToSingleDigit(year1)] },
      [year2]: { number: reduceToSingleDigit(year2), planet: PLANET_BY_NUMBER[reduceToSingleDigit(year2)] },
    },
    loShu: {
      counts: r.loShu.counts,
      missing: r.loShu.missing,
      repeated: r.loShu.repeated,
    },
  };
}

export interface GenerateOptions {
  client?: Anthropic;
}

/**
 * Generate the personalised report narrative for a customer.
 * Throws on API/validation error — callers should fall back to static content.
 */
export async function generateReportContent(
  opts: ReportOptions,
  gen: GenerateOptions = {},
): Promise<ResolvedContent> {
  const client = gen.client ?? new Anthropic();
  const year1 = opts.year1 ?? (opts.preparedDate ?? new Date()).getFullYear();
  const year2 = opts.year2 ?? year1 + 1;

  const payload = describe(opts, year1, year2);

  const response = await client.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    thinking: { type: "disabled" },
    output_config: { effort: "medium", format: zodOutputFormat(contentSchema) },
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content:
          `Write the LifeScript report narrative for this person. ` +
          `The two prediction years are ${year1} and ${year2}.\n\n` +
          `Computed numerology:\n${JSON.stringify(payload, null, 2)}`,
      },
    ],
  });

  const parsed = response.parsed_output;
  if (!parsed) {
    throw new Error(`Content generation failed (stop_reason: ${response.stop_reason})`);
  }

  // Coerce the loose string[] paras into the [string, string] tuples the
  // template expects, and trim arrays to their intended lengths.
  const asPair = (a: string[]): [string, string] => [a[0] ?? "", a[1] ?? a[0] ?? ""];
  const yc = (y: typeof parsed.year1): ResolvedContent["year1"] => ({
    theme: y.theme,
    essence: y.essence,
    paras: asPair(y.paras),
    opportunities: y.opportunities.slice(0, 4),
    takeCare: y.takeCare.slice(0, 4),
  });

  return {
    mulank: {
      essence: parsed.mulank.essence,
      paras: asPair(parsed.mulank.paras),
      strengths: parsed.mulank.strengths.slice(0, 4),
      growth: parsed.mulank.growth.slice(0, 4),
    },
    bhagyank: {
      essence: parsed.bhagyank.essence,
      paras: asPair(parsed.bhagyank.paras),
      favours: parsed.bhagyank.favours.slice(0, 4),
      asks: parsed.bhagyank.asks.slice(0, 4),
    },
    name: {
      essence: parsed.name.essence,
      paras: asPair(parsed.name.paras),
      gives: parsed.name.gives.slice(0, 4),
      useWisely: parsed.name.useWisely.slice(0, 4),
    },
    loshu: {
      strongPlanes: parsed.loshu.strongPlanes.slice(0, 4),
      missingItems: parsed.loshu.missingItems,
      missingTitle: parsed.loshu.missingTitle,
    },
    year1: yc(parsed.year1),
    year2: yc(parsed.year2),
    thankyou: { message: parsed.thankyou.message },
  };
}
