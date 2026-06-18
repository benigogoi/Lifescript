/**
 * LifeScript — Claude content engine.
 *
 * Hybrid generation: the static knowledge base (report-data.ts) supplies the
 * full narrative backbone for free — essences, lists, year predictions, the
 * thank-you message. The single Claude call only writes the one thing a
 * knowledge base can't: a short paragraph per core number explaining how
 * THIS person's specific combination of numbers interacts. That's ~3 short
 * paragraphs (a few hundred output tokens) instead of regenerating the
 * entire report (~10,600 tokens), cutting per-report API cost by ~90%+
 * while keeping the most personally-resonant part of the report unique to
 * each customer.
 *
 * Model: claude-sonnet-4-6 (per the project brief — good cost/quality balance
 * for the ₹99 product). Requires ANTHROPIC_API_KEY in the environment.
 */
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { calculateNumerology } from "./numerology";
import { staticContent } from "./report-template";
import type { ReportOptions, ResolvedContent } from "./report-template";

const MODEL = "claude-sonnet-4-6";

const comboSchema = z.object({
  mulankCombo: z.string().describe(
    "2-4 sentences, a complete standalone paragraph (capitalised, NOT a continuation clause) on how this person's Mulank specifically combines with their Bhagyank, Name Number and Lo Shu pattern — the personality angle.",
  ),
  bhagyankCombo: z.string().describe(
    "2-4 sentences, a complete standalone paragraph on how this person's Bhagyank specifically combines with their Mulank, Name Number and Lo Shu pattern — the destiny/life-path angle.",
  ),
  nameCombo: z.string().describe(
    "2-4 sentences, a complete standalone paragraph on how this person's Name Number specifically combines with their Mulank, Bhagyank and Lo Shu pattern — how others perceive them given that combination.",
  ),
});

const SYSTEM = `You are the master numerologist behind LifeScript, an Indian/Vedic numerology service. The report's core narrative is already written from a static knowledge base — your only job is to add the one thing a static page can't: how THIS person's specific combination of numbers interacts.

VOICE & RULES (critical):
- Warm, empowering, and rooted in Indian cultural context. Address the reader as "you".
- Plain, beautiful English (no Hindi yet). No jargon dumps.
- NEVER harsh, fatalistic, or cursing. Never predict misfortune. Frame every tension as growth.
- Use the Indian planetary rulers: 1=Sun(Surya), 2=Moon(Chandra), 3=Jupiter(Brihaspati), 4=Rahu, 5=Mercury(Budh), 6=Venus(Shukra), 7=Ketu, 8=Saturn(Shani), 9=Mars(Mangal).

TASK:
Write one paragraph each for Mulank, Bhagyank, and Name Number. Each paragraph must be about the COMBINATION, not the number alone — name what's distinctive about how these specific numbers sit together for this person (agreement, tension, or balance), and resolve any tension gracefully rather than contradicting yourself. Vary the angle per paragraph as described in the schema so the three don't just repeat each other. If Lo Shu has no missing or repeated digits, build the combination from the three core numbers alone.`;

/** Build the prompt payload describing this customer's computed numerology. */
function describe(opts: ReportOptions) {
  const r = calculateNumerology(opts);
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
  };
}

export interface GenerateOptions {
  client?: Anthropic;
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
): Promise<ResolvedContent> {
  const client = gen.client ?? new Anthropic();
  const year1 = opts.year1 ?? (opts.preparedDate ?? new Date()).getFullYear();
  const year2 = opts.year2 ?? year1 + 1;

  const r = calculateNumerology(opts);
  const base = staticContent(r, year1, year2);
  const payload = describe(opts);

  const response = await client.messages.parse({
    model: MODEL,
    max_tokens: 1500,
    thinking: { type: "disabled" },
    output_config: { effort: "medium", format: zodOutputFormat(comboSchema) },
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content:
          `Write the personalised combination insight for this LifeScript customer.\n\n` +
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

  return {
    ...base,
    mulank: { ...base.mulank, paras: [...base.mulank.paras, parsed.mulankCombo] },
    bhagyank: { ...base.bhagyank, paras: [...base.bhagyank.paras, parsed.bhagyankCombo] },
    name: { ...base.name, paras: [...base.name.paras, parsed.nameCombo] },
  };
}
