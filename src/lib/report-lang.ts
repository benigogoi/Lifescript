/**
 * Mystic Digits — report language registry.
 *
 * Everything DETERMINISTIC the report template needs per language: UI chrome
 * strings, month/planet names, numerals, and the factual correspondence
 * tables (lucky elements, remedies) that are keyed by number and must never
 * be invented by the content engine.
 *
 * The NARRATIVE (essences, paragraphs, panel bullets) is per-customer: in
 * English it comes from the static knowledge base + Claude combo paragraphs;
 * in Assamese it is fully written by the content engine (see content-engine).
 *
 * 'hi' (Hindi) is reserved in the DB check constraint but has no pack yet.
 */
import type { Digit, Planet } from "./numerology";
import type { YearTier } from "./report-data";

export const REPORT_LANGS = ["en", "as"] as const;
export type ReportLang = (typeof REPORT_LANGS)[number];

export function isReportLang(v: unknown): v is ReportLang {
  return typeof v === "string" && (REPORT_LANGS as readonly string[]).includes(v);
}

// ---------------------------------------------------------------------------
// Assamese numerals + calendar
// ---------------------------------------------------------------------------

const AS_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

/** Convert Western digits in a string/number to Assamese numerals. */
export function asNumerals(n: number | string): string {
  return String(n).replace(/[0-9]/g, (d) => AS_DIGITS[Number(d)]);
}

export const MONTHS_AS = [
  "জানুৱাৰী", "ফেব্ৰুৱাৰী", "মাৰ্চ", "এপ্ৰিল", "মে'", "জুন",
  "জুলাই", "আগষ্ট", "ছেপ্টেম্বৰ", "অক্টোবৰ", "নৱেম্বৰ", "ডিচেম্বৰ",
];

export const PLANET_AS: Record<Planet, string> = {
  Sun: "সূৰ্য",
  Moon: "চন্দ্ৰ",
  Jupiter: "বৃহস্পতি",
  Rahu: "ৰাহু",
  Mercury: "বুধ",
  Venus: "শুক্ৰ",
  Ketu: "কেতু",
  Saturn: "শনি",
  Mars: "মঙ্গল",
};

const TIMES_AS = ["", "এবাৰ", "দুবাৰ", "তিনিবাৰ", "চাৰিবাৰ", "পাঁচবাৰ", "ছবাৰ", "সাতবাৰ", "আঠবাৰ"];

// ---------------------------------------------------------------------------
// Assamese chrome — every fixed string the template renders
// ---------------------------------------------------------------------------

export const CHROME_AS = {
  tagline: "আপোনাৰ কাহিনী · আপোনাৰ সংখ্যা · আপোনাৰ জীৱন",
  /** Cover headline; `{name}` is the (transliterated) first name. */
  coverTitle: (nameHtml: string) => `${nameHtml}ৰ<br/>সংখ্যাতত্ত্ব`,
  prepared: "প্ৰস্তুত",
  mulankLabel: "মূলাংক",
  bhagyankLabel: "ভাগ্যাংক",
  nameNumLabel: "নামৰ সংখ্যা",
  ruledBy: "অধিপতি গ্ৰহ",
  kickers: {
    mulank: "মূলাংক · জন্ম সংখ্যা",
    bhagyank: "ভাগ্যাংক · ভাগ্যৰ সংখ্যা",
    name: "নামৰ সংখ্যা · আপোনাৰ নামৰ ধ্বনি",
    loshu: "লো শ্যু গ্ৰিড · আপোনাৰ শক্তিৰ মানচিত্ৰ",
    year: (year: number) => `আপোনাৰ আগন্তুক বছৰ · ${asNumerals(year)}`,
    lucky: (planet: Planet) => `শুভ উপাদান · আপোনাৰ ${PLANET_AS[planet]}ৰ লগত মিলাই লোৱা`,
    remedies: (planet: Planet) => `বৈদিক প্ৰতিকাৰ · আপোনাৰ ${PLANET_AS[planet]}ক শক্তিশালী কৰক`,
  },
  titles: {
    mulank: (planet: Planet) => `${PLANET_AS[planet]}ৰ সন্তান`,
    bhagyank: (planet: Planet) => `${PLANET_AS[planet]}ৰ পথ`,
    name: (firstName: string) => `“${firstName}” নামটো`,
    loshu: "আপুনি কঢ়িয়াই ফুৰা সংখ্যাবোৰ",
    lucky: "কিহে আপোনালৈ সৌভাগ্য আনে",
    remedies: "সৰল দৈনিক অভ্যাস",
  },
  panels: {
    strengths: "আপোনাৰ শক্তি",
    growth: "বিকাশৰ দিশ",
    favours: "ভাগ্যই য’ত আপোনাক সহায় কৰে",
    asks: "ভাগ্যই আপোনাৰ পৰা যি বিচাৰে",
    gives: "আপোনাৰ নামে আপোনাক দিয়ে",
    useWisely: "বুজি-শুনি ব্যৱহাৰ কৰক",
    opportunities: "সুযোগ",
    takeCare: "সাৱধান থাকক",
    strongPlanes: "আপোনাৰ সবল দিশবোৰ",
  },
  loshu: {
    legendPresent: "আপোনাৰ চাৰ্টত আছে",
    legendMissing: "নথকা সংখ্যা",
    missingTitle: (missing: Digit[]) =>
      missing.length ? `নথকা সংখ্যা: ${missing.map((d) => asNumerals(d)).join(" · ")}` : "সম্পূৰ্ণ গ্ৰিড",
    completeGridNote: "আপোনাৰ চাৰ্টত প্ৰতিটো সংখ্যাই আছে — এক বিৰল, সন্তুলিত শক্তিৰ মানচিত্ৰ।",
    strongRepeated: (d: Digit, planet: Planet, count: number) =>
      `${asNumerals(d)} সংখ্যা (${PLANET_AS[planet]}) ${TIMES_AS[Math.min(count, 8)]} আছে — প্ৰবল ${PLANET_AS[planet]}ৰ শক্তি`,
    strongPresent: (d: Digit, planet: Planet) =>
      `${asNumerals(d)} সংখ্যা (${PLANET_AS[planet]}) আপোনাৰ চাৰ্টত আছে`,
  },
  year: {
    universalYear: "বিশ্বজনীন বৰ্ষ",
    planetLine: (uy: Digit, planet: Planet) => `সংখ্যা ${asNumerals(uy)} · ${PLANET_AS[planet]}`,
    tierLabel: "আপোনাৰ ব্যক্তিগত দৃষ্টিভংগী",
  },
  lucky: {
    days: "শুভ দিন",
    colors: "শুভ ৰং",
    numbers: "শুভ সংখ্যা",
    gemstone: "ৰত্ন",
    metal: "শুভ ধাতু",
    direction: "শুভ দিশ",
    bonusLabel: (planet: Planet) => `ভাগ্যাংকৰ অতিৰিক্ত · ${PLANET_AS[planet]}`,
    bonusText: (planet: Planet, days: string, color: string) =>
      `আপোনাৰ ভাগ্যাংকৰ গ্ৰহ ${PLANET_AS[planet]}ৰ বাবে ${days} আৰু ${color} ৰঙো শুভ।`,
  },
  remedies: {
    mantraLabel: "আপোনাৰ মন্ত্ৰ",
    bonusLabel: (planet: Planet) => `ভাগ্যাংকৰ অতিৰিক্ত · ${PLANET_AS[planet]}`,
    bonusText: (mantra: string, mantraSub: string) => `${mantra} — ${mantraSub}।`,
  },
  thankyou: {
    namaste: (firstName: string) => `নমস্কাৰ, ${firstName}`,
  },
  missingNotes: {
    1: "১ — আত্মবিশ্বাস আৰু নেতৃত্বৰ সাহস বঢ়াবলৈ যত্ন কৰক",
    2: "২ — অনুভূতি আৰু ধৈৰ্যক সচেতনভাৱে লালন কৰক",
    3: "৩ — মনৰ কথা প্ৰকাশ কৰাৰ সাহস আৰু কল্পনাশক্তি বঢ়াওক",
    4: "৪ — শৃংখলা আৰু নিয়মীয়া অভ্যাস যত্নেৰে গঢ়ক",
    5: "৫ — নমনীয়তা আৰু পৰিৱৰ্তনক আদৰিবলৈ শিকক",
    6: "৬ — ঘৰ-পৰিয়াল আৰু সম্পৰ্কক সময় দিয়ক",
    7: "৭ — ধ্যান আৰু ভিতৰলৈ চোৱাৰ অভ্যাস কৰক",
    8: "৮ — শৃংখলা আৰু ব্যৱহাৰিক পৰিকল্পনা শক্তিশালী কৰক",
    9: "৯ — সাহস আৰু মানৱ-সেৱাৰ মনোভাৱ বঢ়াওক",
  } as Record<Digit, string>,
} as const;

export const YEAR_TIER_AS: Record<YearTier, string> = {
  "Highly Favourable": "অতি অনুকূল",
  Favourable: "অনুকূল",
  Steady: "স্থিৰ",
  Challenging: "প্ৰত্যাহ্বানপূৰ্ণ",
};

// ---------------------------------------------------------------------------
// Assamese lucky elements — same facts as LUCKY in report-data.ts
// ---------------------------------------------------------------------------

export interface LuckyAs {
  days: string;
  colors: { name: string; hex: string }[];
  numbers: string;
  gemstone: string;
  metal: string;
  direction: string;
}

export const LUCKY_AS: Record<Digit, LuckyAs> = {
  1: { days: "দেওবাৰ আৰু সোমবাৰ", colors: [{ name: "সোণালী", hex: "#E6C766" }, { name: "কমলা", hex: "#E08A3C" }, { name: "হালধীয়া", hex: "#EBD55A" }], numbers: "১, ৩ আৰু ৯", gemstone: "মাণিক্য (ৰুবী)", metal: "সোণ আৰু তাম", direction: "পূব" },
  2: { days: "সোমবাৰ আৰু শুক্ৰবাৰ", colors: [{ name: "বগা", hex: "#F0F0F5" }, { name: "ক্ৰীম", hex: "#EDE6D0" }, { name: "ৰূপালী", hex: "#C8CCD4" }], numbers: "২, ৭ আৰু ৯", gemstone: "মুকুতা (মতি)", metal: "ৰূপ", direction: "উত্তৰ-পশ্চিম" },
  3: { days: "বৃহস্পতিবাৰ", colors: [{ name: "হালধীয়া", hex: "#EBD55A" }, { name: "সোণালী", hex: "#E6C766" }, { name: "গেৰুৱা", hex: "#E89A3C" }], numbers: "৩, ৬ আৰু ৯", gemstone: "পোখৰাজ", metal: "সোণ", direction: "উত্তৰ-পূব" },
  4: { days: "শনিবাৰ আৰু দেওবাৰ", colors: [{ name: "ধূসৰ", hex: "#9AA0A8" }, { name: "নীলা", hex: "#5B7FA6" }, { name: "খাকী", hex: "#B7A77E" }], numbers: "৪, ৮ আৰু ১", gemstone: "গোমেদ", metal: "মিশ্ৰিত ধাতু", direction: "দক্ষিণ-পশ্চিম" },
  5: { days: "বুধবাৰ", colors: [{ name: "সেউজীয়া", hex: "#5BA877" }, { name: "ফিৰোজা", hex: "#4FB3B0" }, { name: "পাতল ধূসৰ", hex: "#C2C6CC" }], numbers: "৫ আৰু ৬", gemstone: "পান্না", metal: "ব্ৰঞ্জ আৰু পিতল", direction: "উত্তৰ" },
  6: { days: "শুক্ৰবাৰ", colors: [{ name: "বগা", hex: "#F0F0F5" }, { name: "গুলপীয়া", hex: "#E59BB0" }, { name: "পাতল নীলা", hex: "#A9C7E0" }], numbers: "৬, ৫ আৰু ৯", gemstone: "হীৰা", metal: "ৰূপ আৰু প্লেটিনাম", direction: "দক্ষিণ-পূব" },
  7: { days: "সোমবাৰ আৰু দেওবাৰ", colors: [{ name: "ধোঁৱা-ধূসৰ", hex: "#8A8A94" }, { name: "সাগৰীয় সেউজ", hex: "#5FA28C" }, { name: "বগা", hex: "#F0F0F5" }], numbers: "৭ আৰু ২", gemstone: "বৈদূৰ্য (কেটছ আই)", metal: "মিশ্ৰিত ধাতু", direction: "উত্তৰ-পূব" },
  8: { days: "শনিবাৰ", colors: [{ name: "ক’লা", hex: "#3A3A42" }, { name: "ডাঠ নীলা", hex: "#33456B" }, { name: "ডাঠ ধূসৰ", hex: "#6E6E78" }], numbers: "৮ আৰু ৪", gemstone: "নীলম (ব্লু ছেফায়াৰ)", metal: "লো আৰু তীখা", direction: "পশ্চিম" },
  9: { days: "মঙলবাৰ", colors: [{ name: "ৰঙা", hex: "#D9534F" }, { name: "প্ৰবাল ৰঙা", hex: "#E0775C" }, { name: "গাঢ় ৰঙা", hex: "#B23A48" }], numbers: "৯, ৩ আৰু ৬", gemstone: "প্ৰবাল (মুংগা)", metal: "তাম", direction: "দক্ষিণ" },
};

// ---------------------------------------------------------------------------
// Assamese remedies — same practices as REMEDIES in report-data.ts
// ---------------------------------------------------------------------------

export interface RemediesAs {
  mantra: string;
  mantraSub: string;
  items: { title: string; desc: string }[];
}

export const REMEDIES_AS: Record<Digit, RemediesAs> = {
  1: {
    mantra: "ওঁ সূৰ্যায় নমঃ",
    mantraSub: "সূৰ্যক প্ৰণাম জনাই সূৰ্যোদয়ৰ সময়ত ১১ বা ১০৮ বাৰ জপ কৰক",
    items: [
      { title: "সূৰ্যক অৰ্ঘ্য দিয়ক", desc: "প্ৰতিদিনে সূৰ্যোদয়ত পূব ফালে মুখ কৰি তামৰ ঘটিৰে সূৰ্যক পানী (অৰ্ঘ্য) আগবঢ়াওক — সূৰ্যৰ বাবে আটাইতকৈ সৰল আৰু শক্তিশালী প্ৰতিকাৰ।" },
      { title: "মাণিক্য (ৰুবী) পিন্ধক", desc: "সোণত খটোৱা ৰুবী, দেওবাৰে অনামিকাত — আপোনাৰ কোষ্ঠী চোৱা এজন বিশ্বাসী জ্যোতিষীৰ পৰামৰ্শৰ পিছতহে।" },
      { title: "দেওবাৰে দান কৰক", desc: "অভাৱত থকাজনক ঘেঁহু, গুৰ বা তাম দান কৰক। সূৰ্যৰ দিনত কৰা দানে আশীৰ্বাদ বহুগুণে বঢ়ায়।" },
      { title: "পিতৃ আৰু বয়োজ্যেষ্ঠক সন্মান কৰক", desc: "সূৰ্য পিতৃৰ কাৰক গ্ৰহ। বয়োজ্যেষ্ঠৰ প্ৰতি শ্ৰদ্ধাই আপোনাৰ জীৱনত সূৰ্যৰ পোহৰ প্ৰত্যক্ষভাৱে বঢ়ায়।" },
      { title: "ৰাতিপুৱাৰ লগে লগে উঠক", desc: "সূৰ্যোদয়ৰ আগতে শয্যা এৰক আৰু দিনটোৰ কেইমিনিটমান ৰ’দত কটাওক — ই প্ৰাণশক্তি আৰু মনৰ স্পষ্টতা ঘূৰাই আনে।" },
    ],
  },
  2: {
    mantra: "ওঁ চন্দ্ৰায় নমঃ",
    mantraSub: "সোমবাৰে জপ কৰি চন্দ্ৰক শক্তিশালী কৰক",
    items: [
      { title: "চন্দ্ৰক সন্মান কৰক", desc: "সোমবাৰৰ ৰাতি চন্দ্ৰক গাখীৰ বা পানী আগবঢ়াওক, আৰু সন্ধিয়াৰ সময়ছোৱা শান্তভাৱে কটাওক।" },
      { title: "মুকুতা (মতি) পিন্ধক", desc: "ৰূপত খটোৱা মুকুতা, সোমবাৰে কনিষ্ঠ আঙুলিত — জ্যোতিষীয় পৰামৰ্শৰ পিছতহে।" },
      { title: "বগা বস্তু দান কৰক", desc: "সোমবাৰে চাউল, গাখীৰ বা বগা কাপোৰ দান কৰক — মানসিক শান্তি আৰু ভাৰসাম্য আহে।" },
      { title: "মাতৃক শ্ৰদ্ধা কৰক", desc: "চন্দ্ৰ মাতৃৰ কাৰক। মাক আৰু বয়োজ্যেষ্ঠা মহিলাক যত্ন কৰিলে ভিতৰৰ চন্দ্ৰ শক্তিশালী হয়।" },
      { title: "পানীৰ ওচৰত সময় কটাওক", desc: "জলাশয়ৰ ওচৰত সময় কটাওক আৰু পৰ্যাপ্ত পানী খাওক — চন্দ্ৰৰ তত্ত্বই আপোনাক শান্ত আৰু স্থিৰ কৰে।" },
    ],
  },
  3: {
    mantra: "ওঁ বৃহস্পতয়ে নমঃ",
    mantraSub: "বৃহস্পতিবাৰে জপ কৰি বৃহস্পতিক শক্তিশালী কৰক",
    items: [
      { title: "বৃহস্পতিক সন্মান কৰক", desc: "বৃহস্পতিবাৰে পূজা আৰু জপ কৰক; হালধীয়া ফুল আগবঢ়াওক আৰু শিক্ষক-গুৰুক শ্ৰদ্ধা কৰক।" },
      { title: "পোখৰাজ পিন্ধক", desc: "সোণত খটোৱা পোখৰাজ, বৃহস্পতিবাৰে তৰ্জনীত — জ্যোতিষীয় পৰামৰ্শৰ পিছতহে।" },
      { title: "হালধীয়া বস্তু দান কৰক", desc: "বৃহস্পতিবাৰে হালধি, বুটমাহৰ দাইল বা কল দান কৰক — জ্ঞান আৰু উন্নতি আহে।" },
      { title: "শিক্ষক আৰু বয়োজ্যেষ্ঠক শ্ৰদ্ধা কৰক", desc: "বৃহস্পতি স্বয়ং গুৰু। গুৰুজনক সন্মান আৰু জ্ঞানৰ সাধনাই তেওঁৰ কৃপা বঢ়ায়।" },
      { title: "খুৱাওক আৰু দিয়ক", desc: "উদাৰতা আৰু আনক খুউৱাৰ অভ্যাসে আপোনাৰ জীৱনত বৃহস্পতিৰ আশীৰ্বাদ বিস্তাৰ কৰে।" },
    ],
  },
  4: {
    mantra: "ওঁ ৰাহৱে নমঃ",
    mantraSub: "ৰাহুক শান্ত আৰু সন্তুলিত কৰিবলৈ জপ কৰক",
    items: [
      { title: "ৰাহুক শান্ত কৰক", desc: "ৰাহু মন্ত্ৰ জপ কৰক আৰু আপোনাৰ পৰিৱেশ চাফা-চিকুণ ৰাখক — ইয়ে ৰাহুৰ অস্থিৰ শক্তিক থিতাপি দিয়ে।" },
      { title: "গোমেদ পিন্ধক", desc: "ৰাহুৰ ৰত্ন অতি শক্তিশালী — সাৱধানী জ্যোতিষীয় পৰামৰ্শৰ পিছতহে, উপযুক্তভাৱে খটোৱাই পিন্ধিব।" },
      { title: "শনিবাৰে দান কৰক", desc: "সৰিয়হৰ তেল, কম্বল বা ক’লা তিল অভাৱীক দান কৰক — ৰাহুৰ প্ৰভাৱ কোমল হয়।" },
      { title: "অৱহেলিতক সেৱা কৰক", desc: "সমাজৰ প্ৰান্তত থকা মানুহক সহায় কৰিলে ৰাহুৰ ভাল দিশটোৰ লগত আপুনি মিলি যায়।" },
      { title: "কথাৰ মান ৰাখক", desc: "সততা আৰু স্পষ্টতাই ৰাহুৰ বিভ্ৰান্তি আৰু মায়াৰ প্ৰৱণতাক প্ৰতিহত কৰে।" },
    ],
  },
  5: {
    mantra: "ওঁ বুধায় নমঃ",
    mantraSub: "বুধবাৰে জপ কৰি বুধক শক্তিশালী কৰক",
    items: [
      { title: "বুধক সন্মান কৰক", desc: "বুধবাৰে জপ কৰক আৰু মগজুক কামত লগাওক — পঢ়া, শিকা আৰু স্পষ্ট কথা-বতৰাই বুধক সন্তুষ্ট কৰে।" },
      { title: "পান্না পিন্ধক", desc: "সোণত খটোৱা পান্না, বুধবাৰে কনিষ্ঠ আঙুলিত — জ্যোতিষীয় পৰামৰ্শৰ পিছতহে।" },
      { title: "সেউজীয়া বস্তু দান কৰক", desc: "বুধবাৰে মগুমাহ, সেউজীয়া কাপোৰ বা গছ-পুলি দান কৰক — মানসিক স্পষ্টতা আহে।" },
      { title: "পশু-পক্ষীক যত্ন কৰক", desc: "চৰাইক দানা আৰু গৰুক সেউজীয়া ঘাঁহ খুউৱাটো বুধক শক্তিশালী কৰা চিৰাচৰিত প্ৰতিকাৰ।" },
      { title: "শব্দক শুদ্ধভাৱে ব্যৱহাৰ কৰক", desc: "সঁচা, মৰমিয়াল কথা আৰু আৰম্ভ কৰা কাম শেষ কৰাটোৱে বুধৰ শক্তি নিৰ্মল ৰাখে।" },
    ],
  },
  6: {
    mantra: "ওঁ শুক্ৰায় নমঃ",
    mantraSub: "শুক্ৰবাৰে জপ কৰি শুক্ৰক শক্তিশালী কৰক",
    items: [
      { title: "শুক্ৰক সন্মান কৰক", desc: "শুক্ৰবাৰে জপ কৰক; সৌন্দৰ্য, কলা আৰু সম্প্ৰীতিৰে নিজকে আগুৰি ৰাখক — শুক্ৰ সন্তুষ্ট হয়।" },
      { title: "হীৰা পিন্ধক", desc: "বা পৰামৰ্শ অনুসৰি বগা নীলকান্ত — ৰূপ বা প্লেটিনামত খটোৱাই, শুক্ৰবাৰে, পৰামৰ্শৰ পিছতহে।" },
      { title: "বগা আৰু মিঠা বস্তু দান কৰক", desc: "শুক্ৰবাৰে বগা কাপোৰ, চেনী, দৈ বা সুগন্ধি দান কৰক — প্ৰেম আৰু আৰাম আহে।" },
      { title: "নাৰীক সন্মান কৰক", desc: "যিয়ে নাৰী, সম্পৰ্ক আৰু সৌন্দৰ্যক সন্মান কৰে, শুক্ৰই তেওঁক আশীৰ্বাদ দিয়ে।" },
      { title: "সম্প্ৰীতি ৰক্ষা কৰক", desc: "বিবাদ কোমলভাৱে মীমাংসা কৰক আৰু চাৰিওফাল পৰিষ্কাৰ, সুন্দৰ কৰি ৰাখক।" },
    ],
  },
  7: {
    mantra: "ওঁ কেতৱে নমঃ",
    mantraSub: "কেতুক সন্তুলিত আৰু শক্তিশালী কৰিবলৈ জপ কৰক",
    items: [
      { title: "কেতুক শান্ত কৰক", desc: "কেতু মন্ত্ৰ জপ কৰক আৰু নিয়মীয়া আধ্যাত্মিক বা ধ্যানৰ অভ্যাস এটা ৰাখক।" },
      { title: "বৈদূৰ্য (কেটছ আই) পিন্ধক", desc: "কেতুৰ ৰত্ন সূক্ষ্ম অথচ শক্তিশালী — কেৱল সাৱধানী জ্যোতিষীয় পৰামৰ্শৰ পিছতহে পিন্ধিব।" },
      { title: "মঙলবাৰে দান কৰক", desc: "সাধু-সন্ত আৰু অভাৱীক কম্বল, তিল বা আহাৰ দান কৰক — কেতু কোমল হয়।" },
      { title: "অনাসক্তি অভ্যাস কৰক", desc: "ধ্যান, প্ৰাৰ্থনা আৰু সৰল জীৱনে আপোনাক কেতুৰ আধ্যাত্মিক উপহাৰৰ লগত মিলায়।" },
      { title: "কুকুৰ পুহক", desc: "কুকুৰক যত্ন কৰাটো কেতুক শান্ত কৰাৰ লগত জড়িত এক পৰম্পৰাগত প্ৰতিকাৰ।" },
    ],
  },
  8: {
    mantra: "ওঁ শনৈশ্চৰায় নমঃ",
    mantraSub: "শনিবাৰে জপ কৰি শনিক শক্তিশালী কৰক",
    items: [
      { title: "শনিক সন্মান কৰক", desc: "শনিবাৰে জপ কৰক; শৃংখলা, সততা আৰু ধৈৰ্যেৰে কাম কৰক — শনিৰ কৃপা অৰ্জিত হয়।" },
      { title: "নীলম পিন্ধক", desc: "অতি শক্তিশালী ৰত্ন — কেৱল সাৱধানী জ্যোতিষীয় পৰীক্ষা আৰু পৰামৰ্শৰ পিছতহে পিন্ধিব।" },
      { title: "ক’লা বস্তু দান কৰক", desc: "শনিবাৰে ক’লা তিল, সৰিয়হৰ তেল, লো বা কম্বল দৰিদ্ৰক দান কৰক।" },
      { title: "শ্ৰমিক আৰু দৰিদ্ৰক সেৱা কৰক", desc: "শনি শ্ৰম আৰু বঞ্চিতৰ অধিপতি; তেওঁলোকৰ সেৱাই শনিৰ কৃপা দৃঢ় কৰে।" },
      { title: "শৃংখলাবদ্ধ আৰু ন্যায্য হওক", desc: "সৎ শ্ৰম, সময়ানুৱৰ্তিতা আৰু ন্যায্যতাই শনিৰ আটাইতকৈ প্ৰকৃত প্ৰতিকাৰ।" },
    ],
  },
  9: {
    mantra: "ওঁ মঙ্গলায় নমঃ",
    mantraSub: "মঙলবাৰে জপ কৰি মঙ্গলক শক্তিশালী কৰক",
    items: [
      { title: "মঙ্গলক সন্মান কৰক", desc: "মঙলবাৰে জপ কৰক; ব্যায়াম আৰু শৃংখলাবদ্ধ কামৰ মাজেৰে শক্তিক পথ দিয়ক — মঙ্গল সন্তুষ্ট হয়।" },
      { title: "প্ৰবাল (মুংগা) পিন্ধক", desc: "সোণ বা তামত খটোৱা প্ৰবাল, মঙলবাৰে অনামিকাত — জ্যোতিষীয় পৰামৰ্শৰ পিছতহে।" },
      { title: "ৰঙা বস্তু দান কৰক", desc: "মঙলবাৰে মচুৰ দাইল, ৰঙা কাপোৰ বা গুৰ দান কৰক — মঙ্গল শান্ত হয়।" },
      { title: "সাহসেৰে সেৱা কৰক", desc: "আনক ৰক্ষা কৰা আৰু ভাল কামত দেখুওৱা সাহসে আপোনাক মঙ্গলৰ শক্তিৰ লগত মিলায়।" },
      { title: "খং নিয়ন্ত্ৰণ কৰক", desc: "শাৰীৰিক পৰিশ্ৰম আৰু ধৈৰ্যই মঙ্গলৰ জুইক ধ্বংসাত্মক নহৈ সৃষ্টিশীল কৰি ৰাখে।" },
    ],
  },
};
