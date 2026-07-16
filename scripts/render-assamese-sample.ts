/**
 * PROOF OF CONCEPT — fully Assamese sample report, no Claude API.
 *
 * Renders the Benimadhab Gogoi (28 Jan 1992) report with hand-written
 * Assamese content, so a native reviewer can judge translation quality and
 * Devanagari→Bengali-Assamese-script typography inside the locked dark/gold
 * design. Not wired into production — the real implementation will be a
 * language registry in report-template.ts.
 *
 *   CHROME_PATH="C:/Program Files/Google/Chrome/Application/chrome.exe" \
 *   npx tsx scripts/render-assamese-sample.ts
 *
 * Outputs report/out/assamese-sample.html, per-page PNGs (as-*.png) and
 * report/out/mysticdigits_report_benimadhab_gogoi_assamese.pdf
 */
import puppeteer from "puppeteer";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { calculateNumerology, reduceToSingleDigit, LO_SHU_LAYOUT, type Digit, type Planet } from "../src/lib/numerology";
import { STARFIELD_DATA_URI } from "../src/lib/starfield";

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "report", "out");
const SYSTEM_CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";

// ---------------------------------------------------------------------------
// Sample customer — same person as the existing English sample PDF, so the
// two can be reviewed side by side.
// ---------------------------------------------------------------------------
const CUSTOMER = { fullName: "Benimadhab Gogoi", day: 28, month: 1, year: 1992 };
const DISPLAY_NAME = "বেণীমাধৱ গগৈ";
const DISPLAY_FIRST = "বেণীমাধৱ";
const YEAR1 = 2026;
const YEAR2 = 2027;

// ---------------------------------------------------------------------------
// Assamese numerals + shared vocabulary
// ---------------------------------------------------------------------------
const AS_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
const asNum = (n: number | string): string =>
  String(n).replace(/[0-9]/g, (d) => AS_DIGITS[Number(d)]);

const PLANET_AS: Record<Planet, string> = {
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

const MONTHS_AS = [
  "জানুৱাৰী", "ফেব্ৰুৱাৰী", "মাৰ্চ", "এপ্ৰিল", "মে'", "জুন",
  "জুলাই", "আগষ্ট", "ছেপ্টেম্বৰ", "অক্টোবৰ", "নৱেম্বৰ", "ডিচেম্বৰ",
];

// ---------------------------------------------------------------------------
// Hand-written Assamese content for THIS chart:
// Mulank 1 (সূৰ্য) · Bhagyank 5 (বুধ) · Name 3 (বৃহস্পতি)
// Lo Shu: 1×2, 2×2, 8×1, 9×2 — missing 3 4 5 6 7 · UY 2026=1, 2027=2 (both অতি অনুকূল)
// ---------------------------------------------------------------------------
const C = {
  cover: {
    tagline: "আপোনাৰ কাহিনী · আপোনাৰ সংখ্যা · আপোনাৰ জীৱন",
    titleHtml: `<span class="accent">${DISPLAY_FIRST}</span>ৰ<br/>সংখ্যাতত্ত্ব`,
    mulankLabel: "মূলাংক",
    bhagyankLabel: "ভাগ্যাংক",
    nameLabel: "নামৰ সংখ্যা",
    prepared: "প্ৰস্তুত",
  },
  mulank: {
    kicker: "মূলাংক · জন্ম সংখ্যা",
    title: "সূৰ্যৰ সন্তান",
    ruledBy: "অধিপতি গ্ৰহ",
    planet: "সূৰ্য",
    essence: "নেতাৰ সংখ্যা — উজ্জ্বল, মৌলিক, আৰু সকলোৰে আগত থিয় হ’বলৈ গঢ়া।",
    paras: [
      `${DISPLAY_FIRST}, আপোনাৰ মূলাংক ১ — আৰম্ভণিৰ সংখ্যা, যাক শাসন কৰে স্বয়ং সূৰ্যই। সূৰ্যই যেনেকৈ উদয় হ’বলৈ কাৰো অনুমতি নালাগে, আপোনাৰ ভিতৰতো তেনে এক সহজাত কৰ্তৃত্ব আছে — আপুনি মাত মতাৰ আগতেই মানুহে সেয়া অনুভৱ কৰে। আনে বনোৱা বাটেৰে খোজ কাঢ়িবলৈ আপোনাৰ জন্ম হোৱা নাই; বাট বনাবলৈহে আপুনি জন্মিছে।`,
      "আপোনাৰ শক্তি হ’ল স্বাধীনতা আৰু ইচ্ছাশক্তিৰ স্পষ্টতা। আপুনি যেতিয়া সিদ্ধান্ত লয়, তেতিয়াই আগবাঢ়ে — আৰু সেই দৃঢ়তালৈ মানুহ আকৰ্ষিত হয়। ১ সংখ্যাৰ শিক্ষা হ’ল, অকলশৰে নহৈ সকলোকে লগত লৈ নেতৃত্ব দিয়া। অহংকাৰ যেতিয়া উদাৰতালৈ কোমল হয়, তেতিয়া আপোনাৰ পোহৰে কেৱল জিলিকিয়েই নাথাকে — উমো দিয়ে।",
      "দৈনন্দিন জীৱনত ই প্ৰায়ে এনেদৰে দেখা যায় — সভাত প্ৰথমে মাত মতাজন আপুনি, কোনেও ল’ব নোখোজা দায়িত্বটো আগবাঢ়ি আহি লোৱাজনো আপুনি। আপোনাৰ ওচৰ-পাজৰৰ মানুহে সদায় ধৰিবই নোৱাৰে যে তেওঁলোকে আপোনাৰ পথকে অনুসৰণ কৰি আছে — তেওঁলোকে কেৱল লক্ষ্য কৰে যে আপুনি থকা ঠাইত কামবোৰ কেনেবাকৈ নিজে নিজেই আগবাঢ়িবলৈ ধৰে।",
    ],
    panelA: { h: "আপোনাৰ শক্তি", items: ["স্বাভাৱিক নেতৃত্ব আৰু উদ্যম", "দৃঢ় ইচ্ছাশক্তি আৰু আত্মবিশ্বাস", "সৃষ্টিশীল, মৌলিক চিন্তা", "আনক আপোন কৰি লোৱা উষ্ণতা"] },
    panelB: { h: "বিকাশৰ দিশ", items: ["আনৰ প্ৰতি ধৈৰ্য ধৰাটো শিকা", "সংকোচ নকৰাকৈ সহায় বিচৰা", "অহংকাৰক নম্ৰতালৈ ৰূপান্তৰিত কৰা", "ভাগৰি পৰাৰ আগতেই জিৰণি লোৱা"] },
  },
  bhagyank: {
    kicker: "ভাগ্যাংক · ভাগ্যৰ সংখ্যা",
    title: "বুধৰ পথ",
    ruledBy: "অধিপতি গ্ৰহ",
    planet: "বুধ",
    essence: "গতি আৰু বুদ্ধিৰ ভাগ্য — জীৱনে আপোনাক বাৰে বাৰে নতুন দুৱাৰৰ সন্মুখত থিয় কৰায়।",
    paras: [
      `${DISPLAY_FIRST}, আপোনাৰ ভাগ্যাংক ৫ — বুধ গ্ৰহৰ দ্বাৰা শাসিত। আপোনাৰ ভাগ্য গতিশীলতাৰে গঢ়া: নতুন মানুহ, নতুন ঠাই, নতুন সুযোগে আপোনাক বাৰে বাৰে বিচাৰি আহে। এঠাইতে বান্ধ খাই থকাটো আপোনাৰ পথ নহয় — পৰিৱৰ্তনেই আপোনাৰ প্ৰকৃত সাৰথি।`,
      "৫-ৰ ভাগ্যই নমনীয়তাক পুৰস্কৃত কৰে। যিমানেই আপুনি কৌতূহলী হৈ থাকে, শিকি থাকে আৰু মানুহৰ লগত সংযোগ ৰাখে, সিমানেই ভাগ্যৰ দুৱাৰবোৰ এখনৰ পিছত আনখন খোল খাই যায়। আপোনাৰ ডাঙৰ সুযোগবোৰ প্ৰায়ে আহে মানুহৰ যোগেদি — এষাৰ কথা, এটা চিনাকি, এক নতুন সংযোগৰ মাজেদি।",
      "বাস্তৱ জীৱনত ইয়াৰ অৰ্থ — ভ্ৰমণ, নতুন দক্ষতা শিকা, কামৰ ক্ষেত্ৰত সাহসী সালসলনি: এইবোৰ আপোনাৰ বাবে ভয়ৰ কথা নহয়, বৰং উত্থানৰ জৰিয়া। একে ঠাইতে ৰৈ থকা জীৱনে আপোনাক বেছিদিন ধৰি ৰাখিব নোৱাৰে — আৰু সেয়া দুৰ্বলতা নহয়, আপোনাৰ ভাগ্যৰেই ছন্দ।",
    ],
    panelA: { h: "ভাগ্যই য’ত আপোনাক সহায় কৰে", items: ["যোগাযোগ, লেখা আৰু ব্যৱসায়", "ভ্ৰমণ আৰু নতুন অভিজ্ঞতা", "নতুন দক্ষতা আৰু কৌশল শিকা", "মানুহৰ সৈতে সংযোগ গঢ়া"] },
    panelB: { h: "ভাগ্যই আপোনাৰ পৰা যি বিচাৰে", items: ["আৰম্ভ কৰা কাম শেষ কৰক", "চঞ্চলতাক লক্ষ্যৰ সৈতে বান্ধক", "আৱেগৰ বশত হঠাৎ সিদ্ধান্ত নল’ব", "স্বাধীনতাৰ লগতে দায়িত্বও লওক"] },
  },
  name: {
    kicker: "নামৰ সংখ্যা · আপোনাৰ নামৰ ধ্বনি",
    title: `“${DISPLAY_FIRST}” নামটো`,
    ruledBy: "অধিপতি গ্ৰহ",
    planet: "বৃহস্পতি",
    essence: "জ্ঞান আৰু সৌভাগ্যৰ নাম — মানুহে আপোনাৰ কথাত সহজে আস্থা পায়।",
    paras: [
      `আপোনাৰ “${DISPLAY_FIRST}” নামটোৱে ৩ সংখ্যাত কম্পন কৰে, যাৰ অধিপতি বৃহস্পতি — গুৰুৰ গ্ৰহ। এই নামে প্ৰথম সাক্ষাততে এক আশ্বাসৰ ভাব দিয়ে: যেন এইজন মানুহৰ ওচৰত জ্ঞানো আছে, আন্তৰিকতাও আছে।`,
      "৩ সংখ্যাৰ নামে শিক্ষা, পৰামৰ্শ, লেখা আৰু নেতৃত্বৰ ক্ষেত্ৰত দুৱাৰ খোলে। মানুহে আপোনাৰ ওচৰলৈ উপদেশ বিচাৰি আহে — সেই বিশ্বাসক সন্মান কৰক, আৰু ই আপোনাৰ আটাইতকৈ ডাঙৰ সম্পদ হৈ ৰ’ব।",
      "অচিনাকি মানুহেৰে ভৰা কোঠাতো এই নামটো এবাৰ চিনাকিতে মনত ৰৈ যায়। সাক্ষাৎকাৰ, আলোচনা, আৰু য’ত প্ৰথম ছাপেই সিদ্ধান্ত লয় — তেনে প্ৰতিটো মুহূৰ্তত এই নামে আপোনাৰ হৈ কাম কৰি থাকে।",
    ],
    panelA: { h: "আপোনাৰ নামে আপোনাক দিয়ে", items: ["আস্থা জগোৱা উপস্থিতি", "জ্ঞানৰ প্ৰতি স্বাভাৱিক আকৰ্ষণ", "শুভ বৃহস্পতিৰ আশীৰ্বাদ", "মানুহক একত্ৰিত কৰাৰ ক্ষমতা"] },
    panelB: { h: "বুজি-শুনি ব্যৱহাৰ কৰক", items: ["জ্ঞানক অহংকাৰ হ’ব নিদিব", "দিয়া প্ৰতিশ্ৰুতি ৰাখক", "কথাৰ লগতে কামো কৰক", "সৰল হৈ থাকক"] },
  },
  loshu: {
    kicker: "লো শ্যু গ্ৰিড · আপোনাৰ শক্তিৰ মানচিত্ৰ",
    title: "আপুনি কঢ়িয়াই ফুৰা সংখ্যাবোৰ",
    legendPresent: "আপোনাৰ চাৰ্টত আছে",
    legendMissing: "নথকা সংখ্যা",
    strongTitle: "আপোনাৰ সবল দিশবোৰ",
    strongPlanes: [
      "১ সংখ্যা (সূৰ্য) দুবাৰ আছে — প্ৰবল আত্মবিশ্বাস আৰু নেতৃত্বৰ শক্তি",
      "২ সংখ্যা (চন্দ্ৰ) দুবাৰ আছে — গভীৰ অনুভূতি আৰু সহানুভূতি",
      "৯ সংখ্যা (মঙ্গল) দুবাৰ আছে — সাহস, প্ৰাণশক্তি আৰু মানৱীয়তা",
      "৮ সংখ্যা (শনি) উপস্থিত — শৃংখলা আৰু কষ্টসহিষ্ণুতা",
    ],
    missingTitle: "নথকা সংখ্যা: ৩ · ৪ · ৫ · ৬ · ৭",
    missingItems: [
      "৩ — মনৰ কথা প্ৰকাশ কৰাৰ সাহস সচেতনভাৱে বঢ়াওক",
      "৪ — শৃংখলা আৰু নিয়মীয়া অভ্যাস যত্নেৰে গঢ়ক",
      "৫ — পৰিৱৰ্তনক ভয় নকৰি নমনীয়তা অভ্যাস কৰক",
      "৬ — ঘৰ-পৰিয়াল আৰু সম্পৰ্কক সময় দিয়ক",
    ],
    combo:
      "আপোনাৰ গ্ৰিডখনত শক্তি কেইটামান সংখ্যাত গভীৰভাৱে কেন্দ্ৰীভূত হৈ আছে — সূৰ্যৰ নেতৃত্ব, চন্দ্ৰৰ অনুভূতি আৰু মঙ্গলৰ সাহস। ইয়াৰ অৰ্থ: আপুনি যি কামত মন দিয়ে, তাত সম্পূৰ্ণ হৃদয়েৰে নামি পৰে। আনহাতে ৩, ৪, ৫, ৬ আৰু ৭ নথকাটোৱে দেখুৱায় যে প্ৰকাশ, শৃংখলা আৰু ধৈৰ্যৰ অভ্যাস আপুনি সচেতনভাৱে গঢ়িব লাগিব। ভাল খবৰটো হ’ল — আপোনাৰ ভাগ্যাংক ৫-এ ঠিক সেই নমনীয়তাৰ পথটোৱেই আপোনাক দেখুৱাই দিয়ে।",
  },
  year1: {
    kicker: `আপোনাৰ আগন্তুক বছৰ · ${asNum(YEAR1)}`,
    theme: "নতুন আৰম্ভণিৰ বছৰ",
    universalYear: "বিশ্বজনীন বৰ্ষ",
    planetLine: "সংখ্যা ১ · সূৰ্য",
    essence: `${asNum(YEAR1)} যোগ কৰিলে ১ হয় — নতুন আৰম্ভণি, সাহসী পদক্ষেপ, আৰু আগন্তুক ন বছৰৰ বাবে বীজ ৰোপণৰ বছৰ।`,
    tierLabel: "আপোনাৰ ব্যক্তিগত দৃষ্টিভংগী",
    tier: "অতি অনুকূল",
    tierClass: "hf",
    paras: [
      `${DISPLAY_FIRST}, ${asNum(YEAR1)} আপোনাৰ বাবে ১ সংখ্যাৰ বছৰ — সূৰ্যৰ দ্বাৰা শাসিত আৰম্ভণিৰ বছৰ। বিশেষ কথাটো হ’ল, আপোনাৰ নিজৰ মূলাংকো ১ — অৰ্থাৎ এই বছৰটো আপোনাৰ নিজৰ ছন্দৰ লগত সম্পূৰ্ণকৈ মিলি যায়। এতিয়া আপুনি যি আৰম্ভ কৰে, সেয়া অস্বাভাৱিক শক্তি লৈ আহে আৰু আগন্তুক চক্ৰটোৰ সুৰ বান্ধি দিয়ে।`,
      "যি কামত আপুনি ইমান দিনে সংকোচ কৰি আছিল, সেয়া মুকলি কৰাৰ বছৰ এইটোৱেই। এই বছৰে সাহসক আদৰণি জনায়, অতিৰিক্ত সাৱধানীক নহয়। আগভাগ লওক, আৰু তাত নিজৰ নামটো লিখক।",
      "এই বছৰৰ শক্তি আপোনাৰ মূলাংকৰ সৈতে পোনপটীয়া সংগতিত চলে — গতিকে ৰৈ থকাতকৈ কাম কৰাৰ এয়াই উপযুক্ত সময়। নতুন অভ্যাস, নতুন আলোচনা আৰু নতুন দায়বদ্ধতাবোৰে এইবাৰ অন্য বছৰতকৈ সহজে শিপা ধৰে।",
    ],
    panelA: { h: "সুযোগ", items: ["নতুন উদ্যোগ আৰু শুভাৰম্ভ", "নেতৃত্বলৈ আগবঢ়া", "বিৰল সংযোগ — দৃঢ়তাৰে কামত লগাওক", "শুভ মাহ: মাৰ্চ, জুলাই, অক্টোবৰ"] },
    panelB: { h: "সাৱধান থাকক", items: ["কেৱল অহংকাৰৰ বশত কাম নকৰিব", "নিজৰ গতি ৰক্ষা কৰক — অতি শ্ৰমৰ পৰা বাচক", "সহজতাই যেন সীমা চেৰাই নাযায়", "শান্ত মাহ: মে’, আগষ্ট"] },
    year: YEAR1,
    uy: 1 as Digit,
  },
  year2: {
    kicker: `আপোনাৰ আগন্তুক বছৰ · ${asNum(YEAR2)}`,
    theme: "সম্পৰ্ক গঢ়াৰ বছৰ",
    universalYear: "বিশ্বজনীন বৰ্ষ",
    planetLine: "সংখ্যা ২ · চন্দ্ৰ",
    essence: `${asNum(YEAR2)} যোগ কৰিলে ২ হয় — ধৈৰ্য, অংশীদাৰিত্ব আৰু আৱেগিক গভীৰতাৰ এটি কোমল বছৰ।`,
    tierLabel: "আপোনাৰ ব্যক্তিগত দৃষ্টিভংগী",
    tier: "অতি অনুকূল",
    tierClass: "hf",
    paras: [
      `${DISPLAY_FIRST}, ${asNum(YEAR2)} আপোনাৰ বাবে ২ সংখ্যাৰ বছৰ — চন্দ্ৰৰ দ্বাৰা শাসিত: কোমল, অন্তৰ্দৃষ্টিসম্পন্ন, সম্পৰ্কমুখী। যোৱা বছৰে ৰোৱা বীজবোৰক এতিয়া বলতকৈ ধৈৰ্য আৰু যত্নৰহে প্ৰয়োজন।`,
      "সম্পৰ্কই এইবাৰ মূল ঠাই লয়: গভীৰ হৈ অহা এটা বন্ধন, এক গুৰুত্বপূৰ্ণ সহযোগিতা, বহুদিনৰ মূৰত হোৱা এটা মিলন। হেঁচা দিয়াতকৈ বেছিকৈ শুনক — আপোনাৰ সংবেদনশীলতাই এইবাৰ নীৰৱ শক্তিলৈ পৰিণত হ’ব।",
      "সূৰ্য আৰু চন্দ্ৰ পৰস্পৰৰ মিত্ৰ — গতিকে এই কোমল বছৰটোও আপোনাৰ পক্ষতে থিয় দিয়ে। মানুহৰ লগত গঢ়া সম্পৰ্ক, কৰা চুক্তি আৰু লোৱা দায়িত্ববোৰ এইবাৰ বিশেষভাৱে ফলৱতী হয়।",
    ],
    panelA: { h: "সুযোগ", items: ["অংশীদাৰিত্ব আৰু সহযোগিতা", "ঘনিষ্ঠ সম্পৰ্ক গভীৰ কৰা", "ধৈৰ্যৰ ফল পোৱা", "শুভ মাহ: ফেব্ৰুৱাৰী, জুন, নৱেম্বৰ"] },
    panelB: { h: "সাৱধান থাকক", items: ["অধৈৰ্য আৰু জোৰ-জবৰদস্তি নকৰিব", "আৱেগৰ উত্থান-পতনলৈ মন কৰক", "সকলো কথা গাত নল’ব", "শান্ত মাহ: এপ্ৰিল, ছেপ্টেম্বৰ"] },
    year: YEAR2,
    uy: 2 as Digit,
  },
  lucky: {
    kicker: "শুভ উপাদান · আপোনাৰ সূৰ্যৰ লগত মিলাই লোৱা",
    title: "কিহে আপোনালৈ সৌভাগ্য আনে",
    items: {
      days: { label: "শুভ দিন", value: "দেওবাৰ আৰু সোমবাৰ" },
      colors: { label: "শুভ ৰং", value: "সোণালী, কমলা, হালধীয়া", hexes: ["#E6C766", "#E08A3C", "#EBD55A"] },
      numbers: { label: "শুভ সংখ্যা", value: "১, ৩ আৰু ৯" },
      gemstone: { label: "ৰত্ন", value: "মাণিক্য (ৰুবী)" },
      metal: { label: "শুভ ধাতু", value: "সোণ আৰু তাম" },
      direction: { label: "শুভ দিশ", value: "পূব" },
    },
    bonusLabel: "ভাগ্যাংকৰ অতিৰিক্ত · বুধ",
    bonusText: "বুধবাৰ আৰু সেউজীয়া ৰঙেও আপোনাৰ পক্ষে কাম কৰে।",
    combo:
      "মন কৰিবলগীয়া কথাটো — আপোনাৰ মূলাংক আৰু ভাগ্যাংকে দুটা পৃথক গ্ৰহৰ আশীৰ্বাদ কঢ়িয়াই আনিছে: সূৰ্যই আপোনাক তেজ দিয়ে, বুধে বুদ্ধি। গুৰুত্বপূৰ্ণ সিদ্ধান্তৰ বাবে দেওবাৰ আৰু বুধবাৰ — এই দুয়োটা দিন বাছি লওক। আৰু কোনো বিশেষ দিনৰ সাজত সোণালী বা কমলা ৰঙৰ এটা স্পৰ্শ ৰাখিলে, আপোনাৰ উপস্থিতিয়ে নিজৰ কামটো নিজেই কৰিব।",
  },
  remedies: {
    kicker: "বৈদিক প্ৰতিকাৰ · আপোনাৰ সূৰ্যক শক্তিশালী কৰক",
    title: "সৰল দৈনিক অভ্যাস",
    mantraLabel: "আপোনাৰ মন্ত্ৰ",
    mantra: "ওঁ সূৰ্যায় নমঃ",
    mantraSub: "সূৰ্যক প্ৰণাম জনাই সূৰ্যোদয়ৰ সময়ত ১১ বা ১০৮ বাৰ জপ কৰক",
    items: [
      { title: "সূৰ্যক অৰ্ঘ্য দিয়ক", desc: "প্ৰতিদিনে সূৰ্যোদয়ত পূব ফালে মুখ কৰি তামৰ ঘটিৰে সূৰ্যক পানী (অৰ্ঘ্য) আগবঢ়াওক — সূৰ্যৰ বাবে আটাইতকৈ সৰল আৰু শক্তিশালী প্ৰতিকাৰ।" },
      { title: "মাণিক্য (ৰুবী) পিন্ধক", desc: "সোণত খটোৱা ৰুবী, দেওবাৰে অনামিকাত — আপোনাৰ কোষ্ঠী চোৱা এজন বিশ্বাসী জ্যোতিষীৰ পৰামৰ্শৰ পিছতহে।" },
      { title: "দেওবাৰে দান কৰক", desc: "অভাৱত থকাজনক ঘেঁহু, গুৰ বা তাম দান কৰক। সূৰ্যৰ দিনত কৰা দানে আশীৰ্বাদ বহুগুণে বঢ়ায়।" },
      { title: "পিতৃ আৰু বয়োজ্যেষ্ঠক সন্মান কৰক", desc: "সূৰ্য পিতৃৰ কাৰক গ্ৰহ। বয়োজ্যেষ্ঠৰ প্ৰতি শ্ৰদ্ধাই আপোনাৰ জীৱনত সূৰ্যৰ পোহৰ প্ৰত্যক্ষভাৱে বঢ়ায়।" },
      { title: "ৰাতিপুৱাৰ লগে লগে উঠক", desc: "সূৰ্যোদয়ৰ আগতে শয্যা এৰক আৰু দিনটোৰ কেইমিনিটমান ৰ’দত কটাওক — ই প্ৰাণশক্তি আৰু মনৰ স্পষ্টতা ঘূৰাই আনে।" },
    ],
    bonusLabel: "ভাগ্যাংকৰ অতিৰিক্ত · বুধ",
    bonusText: "ওঁ বুধায় নমঃ — বুধবাৰে জপ কৰিলে বুধ গ্ৰহ শক্তিশালী হয়।",
    combo:
      "আপোনাৰ বাবে আটাইতকৈ ফলপ্ৰসূ সংমিশ্ৰণটো সৰল: ৰাতিপুৱা সূৰ্যক অৰ্ঘ্য, আৰু দিনটোত সঁচা, স্পষ্ট কথা। সূৰ্যই আপোনাৰ আত্মবিশ্বাস গঢ়ে, বুধে আপোনাৰ বাণী শুৱলা কৰে — এই দুয়োটা একেলগে চলিলে নেতৃত্বও আহে, মানুহো লগত থাকে।",
  },
  thankyou: {
    namaste: `নমস্কাৰ, ${DISPLAY_FIRST}`,
    message:
      "আপোনাৰ সংখ্যাবোৰ পঢ়িবলৈ দিয়াৰ বাবে ধন্যবাদ। আপোনাৰ পথ মুকলি হৈ থাকক, আপোনাৰ সূৰ্য উজ্জ্বলকৈ জিলিকি থাকক, আৰু আপোনাৰ বুধ আপোনাৰ কাষে কাষে খোজ দি থাকক — আৰু আগন্তুক বছৰে আপোনাক সেই সকলোখিনিৰ ফালে লৈ যাওক, যাৰ বাবে আপুনি জন্মিছে।",
  },
  foot: { brand: "Mystic Digits", grid: "লো শ্যু গ্ৰিড" },
};

// ---------------------------------------------------------------------------
// Template (adapted from report-template.ts: Bengali-Assamese font stack,
// no drop cap, softened letter-spacing, Assamese numerals)
// ---------------------------------------------------------------------------

const PETAL_DEF = `<g id="petal"><path d="M100 12 C112 40 112 60 100 78 C88 60 88 40 100 12 Z"/></g>`;

function petals(steps: number): string {
  const out: string[] = [];
  for (let a = 0; a < 360; a += 360 / steps) {
    out.push(`<use href="#petal" transform="rotate(${a} 100 100)"/>`);
  }
  return out.join("");
}

function mandala(opacity: number, steps: number, rings: number[]): string {
  const circles = rings.map((r) => `<circle cx="100" cy="100" r="${r}"/>`).join("");
  return `<svg class="mandala" viewBox="0 0 200 200" style="opacity:${opacity}"><g fill="none" stroke="#C9A84C" stroke-width="0.5">${circles}${PETAL_DEF}${petals(steps)}</g></svg>`;
}

const STARS = `<div class="stars"></div>`;
const FRAME = `<div class="frame"></div>`;

function corner(cls: string): string {
  return `<svg class="corner ${cls}" viewBox="0 0 100 100" fill="none" stroke="#C9A84C" stroke-width="1.2"><path d="M4 40 C4 16 16 4 40 4"/><path d="M4 22 C4 10 10 4 22 4"/><circle cx="40" cy="40" r="2.5" fill="#C9A84C" stroke="none"/></svg>`;
}
const CORNERS = corner("tl") + corner("tr") + corner("bl") + corner("br");

const list = (items: string[]) => items.map((i) => `<li>${i}</li>`).join("");
const bodyParas = (ps: string[]) => ps.map((p) => `<p>${p}</p>`).join("");
const foot = (page: string) =>
  `<div class="page-foot"><span>Mystic Digits · ${DISPLAY_NAME}</span><span>${asNum(page)}</span></div>`;

function buildHtml(): string {
  const r = calculateNumerology(CUSTOMER);
  const mulank = r.mulank.number;
  const bhagyank = r.bhagyank.number;
  const nameNum = r.nameNumber.number;
  const uy1 = reduceToSingleDigit(YEAR1);
  const uy2 = reduceToSingleDigit(YEAR2);

  const dob = `${asNum(CUSTOMER.day)} ${MONTHS_AS[CUSTOMER.month - 1]} ${asNum(CUSTOMER.year)}`;
  const now = new Date();
  const prepared = `${asNum(now.getDate())} ${MONTHS_AS[now.getMonth()]} ${asNum(now.getFullYear())}`;

  const cover = `
<section class="page" id="cover">
  ${STARS}
  <svg class="mandala" viewBox="0 0 200 200"><g fill="none" stroke="#C9A84C" stroke-width="0.5">
    <circle cx="100" cy="100" r="96"/><circle cx="100" cy="100" r="78"/><circle cx="100" cy="100" r="54"/><circle cx="100" cy="100" r="30"/>
    ${PETAL_DEF}${petals(12)}
    <g stroke-width="0.4"><line x1="100" y1="4" x2="100" y2="196"/><line x1="4" y1="100" x2="196" y2="100"/><line x1="29" y1="29" x2="171" y2="171"/><line x1="171" y1="29" x2="29" y2="171"/></g>
  </g></svg>
  ${FRAME}${CORNERS}
  <div class="cover-inner">
    <div class="wordmark">Mystic Digits</div>
    <div class="tagline">${C.cover.tagline}</div>
    <h1 class="cover-title">${C.cover.titleHtml}</h1>
    <div class="cover-name">${DISPLAY_NAME}</div>
    <div class="cover-dob">${dob}</div>
    <div class="divider"><span class="line"></span><span class="dot"></span><span class="line"></span></div>
    <div class="keynums">
      <div class="keynum"><div class="circle">${asNum(mulank)}</div><span class="label">${C.cover.mulankLabel}</span><span class="planet">${PLANET_AS[r.mulank.planet]}</span></div>
      <div class="keynum"><div class="circle">${asNum(bhagyank)}</div><span class="label">${C.cover.bhagyankLabel}</span><span class="planet">${PLANET_AS[r.bhagyank.planet]}</span></div>
      <div class="keynum"><div class="circle">${asNum(nameNum)}</div><span class="label">${C.cover.nameLabel}</span><span class="planet">${PLANET_AS[r.nameNumber.planet]}</span></div>
    </div>
    <div class="cover-foot">mysticdigits.in &nbsp;·&nbsp; ${C.cover.prepared}: ${prepared}</div>
  </div>
</section>`;

  const numberPage = (
    id: string,
    s: typeof C.mulank,
    num: Digit,
    page: string,
    steps = 8,
  ) => `
<section class="page" id="${id}">
  ${STARS}${mandala(0.06, steps, [96, 70, 44])}${FRAME}
  <div class="content-inner">
    <div class="section-kicker">${s.kicker}</div>
    <h2 class="section-title">${s.title}</h2>
    <div class="hero-row">
      <div class="hero-circle">${asNum(num)}</div>
      <div class="hero-meta">
        <div class="rule-by">${s.ruledBy}</div>
        <div class="planet-name">${s.planet}</div>
        <div class="essence">${s.essence}</div>
      </div>
    </div>
    <div class="gold-rule"></div>
    <div class="body-copy">${bodyParas(s.paras)}</div>
    <div class="panels">
      <div class="panel"><h4>${s.panelA.h}</h4><ul>${list(s.panelA.items)}</ul></div>
      <div class="panel"><h4>${s.panelB.h}</h4><ul>${list(s.panelB.items)}</ul></div>
    </div>
  </div>
  ${foot(page)}
</section>`;

  const cells = LO_SHU_LAYOUT.flat().map((digit) => {
    const count = r.loShu.counts[digit];
    const present = count > 0;
    const display = present ? asNum(String(digit).repeat(count)) : asNum(digit);
    return `<div class="cell ${present ? "present" : "missing"}"><span class="num">${display}</span><span class="planet-tag">${PLANET_AS[(["Sun","Moon","Jupiter","Rahu","Mercury","Venus","Ketu","Saturn","Mars"] as Planet[])[digit - 1]]}</span></div>`;
  }).join("");

  const loshuPage = `
<section class="page" id="loshu">
  ${STARS}${FRAME}
  <div class="content-inner">
    <div class="section-kicker">${C.loshu.kicker}</div>
    <h2 class="section-title">${C.loshu.title}</h2>
    <div class="loshu-wrap">
      <div class="loshu">
        <svg class="loshu-geo" viewBox="0 0 200 200" fill="none" stroke="#C9A84C" stroke-width="0.5"><circle cx="100" cy="100" r="98"/><circle cx="100" cy="100" r="74"/><rect x="28" y="28" width="144" height="144"/><rect x="28" y="28" width="144" height="144" transform="rotate(45 100 100)"/>${PETAL_DEF}${petals(4)}</svg>
        <div class="loshu-grid">${cells}</div>
      </div>
    </div>
    <div class="legend">
      <span><i class="swatch" style="background:var(--gold-bright)"></i> ${C.loshu.legendPresent}</span>
      <span><i class="swatch" style="background:rgba(224,90,78,0.4)"></i> ${C.loshu.legendMissing}</span>
    </div>
    <div class="gold-rule"></div>
    <div class="panels">
      <div class="panel"><h4>${C.loshu.strongTitle}</h4><ul>${list(C.loshu.strongPlanes)}</ul></div>
      <div class="panel"><h4>${C.loshu.missingTitle}</h4><ul>${list(C.loshu.missingItems)}</ul></div>
    </div>
    <div class="body-copy"><p>${C.loshu.combo}</p></div>
  </div>
  ${foot("04")}
</section>`;

  const yearPage = (id: string, y: typeof C.year1, page: string) => `
<section class="page" id="${id}">
  ${STARS}${mandala(0.06, 6, [96, 70])}${FRAME}
  <div class="content-inner">
    <div class="section-kicker">${y.kicker}</div>
    <h2 class="section-title">${y.theme}</h2>
    <div class="hero-row">
      <div class="hero-circle">${asNum(y.uy)}</div>
      <div class="hero-meta">
        <div class="rule-by">${y.universalYear}</div>
        <div class="planet-name">${y.planetLine}</div>
        <div class="essence">${y.essence}</div>
        <div class="year-tier tier-${y.tierClass}"><span class="yt-label">${y.tierLabel}</span><strong>${y.tier}</strong></div>
      </div>
    </div>
    <div class="gold-rule"></div>
    <div class="body-copy">${bodyParas(y.paras)}</div>
    <div class="panels">
      <div class="panel"><h4>${y.panelA.h}</h4><ul>${list(y.panelA.items)}</ul></div>
      <div class="panel"><h4>${y.panelB.h}</h4><ul>${list(y.panelB.items)}</ul></div>
    </div>
  </div>
  ${foot(page)}
</section>`;

  const L = C.lucky.items;
  const colorDots = L.colors.hexes.map((h) => `<i style="background:${h}"></i>`).join("");
  const luckyIcon = {
    sun: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="1.4"><circle cx="12" cy="12" r="4.5"/><g stroke-linecap="round"><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/><line x1="5" y1="5" x2="7" y2="7"/><line x1="17" y1="17" x2="19" y2="19"/><line x1="19" y1="5" x2="17" y2="7"/><line x1="7" y1="17" x2="5" y2="19"/></g></svg>`,
    palette: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="1.4"><path d="M12 3a9 9 0 100 18 3 3 0 003-3v-1a2 2 0 012-2h1a3 3 0 003-3 9 9 0 00-12-6z"/></svg>`,
    hash: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="1.4" stroke-linecap="round"><line x1="9" y1="4" x2="7" y2="20"/><line x1="17" y1="4" x2="15" y2="20"/><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/></svg>`,
    gem: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="1.4" stroke-linejoin="round"><path d="M6 3h12l4 6-10 12L2 9z"/><path d="M2 9h20M9 3l3 18M15 3l-3 18"/></svg>`,
    metal: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="1.4"><circle cx="12" cy="14" r="6"/><path d="M9 4h6M12 4v4" stroke-linecap="round"/></svg>`,
    compass: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="1.4" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7l3 5-3 5-3-5z"/></svg>`,
  };
  const luckyItem = (icon: string, label: string, value: string) =>
    `<div class="lucky-item"><div class="lucky-ic">${icon}</div><div><div class="l-label">${label}</div><div class="l-value">${value}</div></div></div>`;

  const luckyPage = `
<section class="page" id="lucky">
  ${STARS}${mandala(0.05, 8, [96, 60])}${FRAME}
  <div class="content-inner">
    <div class="section-kicker">${C.lucky.kicker}</div>
    <h2 class="section-title">${C.lucky.title}</h2>
    <div class="lucky-grid">
      ${luckyItem(luckyIcon.sun, L.days.label, L.days.value)}
      ${luckyItem(luckyIcon.palette, L.colors.label, `${L.colors.value} <span class="color-dots">${colorDots}</span>`)}
      ${luckyItem(luckyIcon.hash, L.numbers.label, L.numbers.value)}
      ${luckyItem(luckyIcon.gem, L.gemstone.label, L.gemstone.value)}
      ${luckyItem(luckyIcon.metal, L.metal.label, L.metal.value)}
      ${luckyItem(luckyIcon.compass, L.direction.label, L.direction.value)}
    </div>
    <div class="secondary-note"><span class="sn-label">${C.lucky.bonusLabel}</span><span class="sn-text">${C.lucky.bonusText}</span></div>
    <div class="body-copy"><p>${C.lucky.combo}</p></div>
  </div>
  ${foot("08")}
</section>`;

  const remedyRows = C.remedies.items.map((it, i) =>
    `<div class="remedy"><div class="r-no">${asNum(i + 1)}</div><div><div class="r-title">${it.title}</div><div class="r-desc">${it.desc}</div></div></div>`
  ).join("");

  const remediesPage = `
<section class="page" id="remedies">
  ${STARS}${mandala(0.06, 8, [96, 70, 44])}${FRAME}
  <div class="content-inner">
    <div class="section-kicker">${C.remedies.kicker}</div>
    <h2 class="section-title">${C.remedies.title}</h2>
    <div class="mantra-box">
      <div class="m-label">${C.remedies.mantraLabel}</div>
      <div class="m-text">${C.remedies.mantra}</div>
      <div class="m-sub">${C.remedies.mantraSub}</div>
    </div>
    <div class="remedies">${remedyRows}</div>
    <div class="secondary-note"><span class="sn-label">${C.remedies.bonusLabel}</span><span class="sn-text">${C.remedies.bonusText}</span></div>
    <div class="body-copy"><p>${C.remedies.combo}</p></div>
  </div>
  ${foot("09")}
</section>`;

  const thankyouPage = `
<section class="page" id="thankyou">
  ${STARS}${mandala(0.09, 12, [96, 78, 54, 30])}${FRAME}${CORNERS}
  <div class="ty-inner">
    <div class="wordmark" style="font-size:18px">Mystic Digits</div>
    <div class="ty-namaste">${C.thankyou.namaste}</div>
    <p class="ty-msg">${C.thankyou.message}</p>
  </div>
</section>`;

  return `<!doctype html>
<html lang="as">
<head>
<meta charset="utf-8" />
<title>Mystic Digits Report — ${DISPLAY_NAME}</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Marcellus&family=Jost:wght@300;400;500;600&family=Noto+Serif+Bengali:wght@400;500;600;700&family=Noto+Sans+Bengali:wght@300;400;500;600&display=swap" rel="stylesheet" />
<style>${CSS}</style>
</head>
<body>
${cover}
${numberPage("mulank", C.mulank, mulank, "02")}
${numberPage("bhagyank", C.bhagyank, bhagyank, "03")}
${loshuPage}
${numberPage("namenum", C.name, nameNum, "05")}
${yearPage("year1", C.year1, "06")}
${yearPage("year2", C.year2, "07")}
${luckyPage}
${remediesPage}
${thankyouPage}
<script>
(function () {
  function fit() {
    document.querySelectorAll(".body-copy").forEach(function (el) {
      el.style.fontSize = "";
      var size = parseFloat(getComputedStyle(el).fontSize);
      while (el.scrollHeight > el.clientHeight + 1 && size > 12.5) {
        size -= 0.5;
        el.style.fontSize = size + "px";
      }
    });
  }
  fit();
  document.fonts.ready.then(fit);
})();
</script>
</body>
</html>`;
}

// Same CSS as the production template, with three changes for Assamese:
// 1. 'Noto Serif Bengali' / 'Noto Sans Bengali' added to every font stack
//    (Cormorant/Jost have no Bengali-Assamese glyphs — without these the
//    text falls back to ugly system fonts in the PDF).
// 2. Drop-cap removed (::first-letter can split a conjunct cluster).
// 3. Letter-spacing softened on labels — wide tracking breaks the visual
//    rhythm of the Bengali-Assamese script.
const CSS = `
  :root { --bg:#0D0D12; --bg-soft:#14141C; --gold:#C9A84C; --gold-bright:#E6C766; --white:#E8E8F0; --muted:#9A9AB0; --red:#E05A4E; }
  * { margin:0; padding:0; box-sizing:border-box; }
  html, body { background:#05050a; }
  .page { position:relative; width:794px; height:1123px; background:var(--bg); color:var(--white); overflow:hidden; font-family:'Jost','Noto Sans Bengali',sans-serif; font-feature-settings:'lnum' 1, 'tnum' 1; margin:0 auto 40px; }
  .stars { position:absolute; inset:0; pointer-events:none; background-image:url(${STARFIELD_DATA_URI}); background-size:100% 100%; background-repeat:no-repeat; }
  .mandala { position:absolute; left:50%; top:50%; width:720px; height:720px; transform:translate(-50%,-50%); opacity:0.10; pointer-events:none; }
  .corner { position:absolute; width:110px; height:110px; opacity:0.55; }
  .corner.tl { top:26px; left:26px; }
  .corner.tr { top:26px; right:26px; transform:scaleX(-1); }
  .corner.bl { bottom:26px; left:26px; transform:scaleY(-1); }
  .corner.br { bottom:26px; right:26px; transform:scale(-1,-1); }
  .frame { position:absolute; inset:40px; border:1px solid rgba(201,168,76,0.28); border-radius:2px; pointer-events:none; }
  .cover-inner { position:relative; z-index:2; height:100%; display:flex; flex-direction:column; align-items:center; text-align:center; padding:96px 70px 64px; }
  .wordmark { font-family:'Marcellus', serif; letter-spacing:7px; font-size:24px; color:var(--gold); text-transform:uppercase; }
  .tagline { font-size:12px; letter-spacing:1.5px; color:var(--muted); margin-top:12px; }
  .cover-title { font-family:'Cormorant Garamond','Noto Serif Bengali',serif; font-weight:500; font-size:54px; line-height:1.25; margin-top:auto; color:var(--white); }
  .cover-title .accent { color:var(--gold-bright); }
  .cover-name { font-family:'Cormorant Garamond','Noto Serif Bengali',serif; font-size:38px; font-weight:600; letter-spacing:0.5px; margin-top:34px; color:var(--white); }
  .cover-dob { font-size:14px; letter-spacing:1.5px; color:var(--muted); margin-top:10px; }
  .divider { display:flex; align-items:center; gap:14px; margin:38px 0; width:60%; }
  .divider .line { flex:1; height:1px; background:linear-gradient(90deg, transparent, var(--gold), transparent); }
  .divider .dot { width:6px; height:6px; transform:rotate(45deg); background:var(--gold); }
  .keynums { display:flex; gap:46px; margin-top:4px; }
  .keynum { display:flex; flex-direction:column; align-items:center; gap:12px; }
  .circle { width:92px; height:92px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-family:'Cormorant Garamond','Noto Serif Bengali',serif; font-feature-settings:'lnum' 1, 'tnum' 1; font-size:44px; font-weight:600; color:var(--gold-bright); background:rgba(201,168,76,0.10); border:1px solid rgba(201,168,76,0.55); }
  .keynum .label { font-size:11px; letter-spacing:1px; color:var(--muted); }
  .keynum .planet { font-size:12px; letter-spacing:0.5px; color:var(--gold); }
  .cover-foot { margin-top:auto; font-size:11px; letter-spacing:1.5px; color:var(--muted); }
  .content-inner { position:relative; z-index:2; height:100%; padding:92px 78px 80px; display:flex; flex-direction:column; }
  .content-inner > * { flex:0 0 auto; }
  .section-kicker { font-size:13px; letter-spacing:2px; color:var(--red); }
  .section-title { font-family:'Cormorant Garamond','Noto Serif Bengali',serif; font-weight:600; font-size:42px; color:var(--white); margin-top:8px; line-height:1.25; }
  .hero-row { display:flex; align-items:center; gap:34px; margin:30px 0 12px; }
  .hero-circle { width:150px; height:150px; border-radius:50%; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-family:'Cormorant Garamond','Noto Serif Bengali',serif; font-feature-settings:'lnum' 1, 'tnum' 1; font-size:84px; font-weight:600; color:var(--gold-bright); background:rgba(201,168,76,0.13); border:1.5px solid rgba(201,168,76,0.6); }
  .hero-meta .rule-by { font-size:13px; letter-spacing:1.5px; color:var(--muted); }
  .hero-meta .planet-name { font-family:'Cormorant Garamond','Noto Serif Bengali',serif; font-size:36px; color:var(--gold); margin:4px 0 10px; }
  .hero-meta .essence { font-size:16px; color:var(--white); opacity:0.85; max-width:320px; line-height:1.55; }
  .year-tier { display:inline-flex; align-items:center; gap:9px; margin-top:12px; padding:6px 14px; border-radius:20px; border:1px solid; }
  .year-tier .yt-label { font-size:11px; letter-spacing:0.5px; opacity:0.75; }
  .year-tier strong { font-family:'Marcellus','Noto Serif Bengali',serif; font-size:14px; letter-spacing:0.3px; }
  .year-tier.tier-hf { color:var(--gold-bright); border-color:rgba(230,199,102,0.5); background:rgba(230,199,102,0.08); }
  .year-tier.tier-fav { color:var(--gold); border-color:rgba(201,168,76,0.4); background:rgba(201,168,76,0.06); }
  .year-tier.tier-steady { color:var(--muted); border-color:rgba(154,154,176,0.35); background:rgba(154,154,176,0.05); }
  .year-tier.tier-challenging { color:var(--red); border-color:rgba(224,90,78,0.4); background:rgba(224,90,78,0.08); }
  .gold-rule { height:1px; background:linear-gradient(90deg, var(--gold), transparent); margin:18px 0; }
  .body-copy { font-size:16.5px; line-height:1.65; color:#D5D5E2; flex:1 1 auto; min-height:0; overflow:hidden; }
  .body-copy p { margin-bottom:10px; }
  .panels { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-top:16px; }
  .panel { background:rgba(255,255,255,0.025); border:1px solid rgba(201,168,76,0.18); border-radius:4px; padding:16px 18px; }
  .panel h4 { font-family:'Marcellus','Noto Serif Bengali',serif; font-size:16.5px; letter-spacing:0.5px; color:var(--gold); margin-bottom:9px; }
  .panel ul { list-style:none; }
  .panel li { font-size:14.5px; line-height:1.45; color:#CFCFDE; padding-left:18px; position:relative; margin-bottom:6px; }
  .panel li::before { content:""; position:absolute; left:2px; top:8px; width:6px; height:6px; background:var(--gold); transform:rotate(45deg); }
  .page-foot { position:absolute; left:78px; right:78px; bottom:40px; display:flex; justify-content:space-between; font-size:11px; letter-spacing:1px; color:var(--muted); }
  .loshu-wrap { display:flex; justify-content:center; margin:30px 0 8px; }
  .loshu { position:relative; width:348px; height:348px; }
  .loshu-geo { position:absolute; inset:-26px; opacity:0.14; }
  .loshu-grid { position:relative; width:100%; height:100%; display:grid; grid-template-columns:repeat(3,1fr); grid-template-rows:repeat(3,1fr); }
  .cell { border:1px solid rgba(201,168,76,0.30); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; }
  .cell .num { font-family:'Cormorant Garamond','Noto Serif Bengali',serif; font-feature-settings:'lnum' 1; font-size:30px; letter-spacing:4px; }
  .cell.present .num { color:var(--gold-bright); text-shadow:0 0 14px rgba(201,168,76,0.45); }
  .cell.missing { background:rgba(224,90,78,0.04); }
  .cell.missing .num { color:rgba(154,154,176,0.35); }
  .cell .planet-tag { font-size:10px; letter-spacing:1px; color:var(--muted); }
  .cell.missing .planet-tag { color:rgba(224,90,78,0.6); }
  .legend { display:flex; justify-content:center; gap:40px; margin-top:22px; font-size:13px; color:var(--muted); }
  .legend span { display:inline-flex; align-items:center; gap:8px; }
  .swatch { width:12px; height:12px; border-radius:3px; display:inline-block; }
  .secondary-note { margin-top:14px; display:flex; align-items:baseline; gap:10px; flex-wrap:wrap; }
  .secondary-note .sn-label { font-family:'Marcellus','Noto Serif Bengali',serif; font-size:12px; letter-spacing:0.5px; color:var(--gold); flex-shrink:0; }
  .secondary-note .sn-text { font-size:13.5px; color:#CFCFDE; }
  .lucky-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-top:30px; }
  .lucky-item { display:flex; align-items:center; gap:16px; background:rgba(255,255,255,0.025); border:1px solid rgba(201,168,76,0.16); border-radius:4px; padding:16px 20px; }
  .lucky-ic { width:42px; height:42px; flex-shrink:0; border-radius:50%; border:1px solid rgba(201,168,76,0.4); display:flex; align-items:center; justify-content:center; color:var(--gold); font-size:18px; }
  .lucky-item .l-label { font-size:11.5px; letter-spacing:1px; color:var(--muted); }
  .lucky-item .l-value { font-family:'Cormorant Garamond','Noto Serif Bengali',serif; font-size:21px; color:var(--white); margin-top:2px; }
  .color-dots { display:inline-flex; gap:6px; vertical-align:middle; margin-left:4px; }
  .color-dots i { width:14px; height:14px; border-radius:50%; display:inline-block; border:1px solid rgba(255,255,255,0.2); }
  .mantra-box { text-align:center; background:rgba(201,168,76,0.06); border:1px solid rgba(201,168,76,0.28); border-radius:4px; padding:24px; margin:28px 0; }
  .mantra-box .m-label { font-size:12px; letter-spacing:2px; color:var(--red); }
  .mantra-box .m-text { font-family:'Cormorant Garamond','Noto Serif Bengali',serif; font-size:27px; color:var(--gold-bright); margin:10px 0 6px; }
  .mantra-box .m-sub { font-size:14px; color:var(--muted); letter-spacing:0.3px; }
  .remedy { display:flex; gap:18px; padding:14px 0; border-bottom:1px solid rgba(255,255,255,0.06); }
  .remedy:last-child { border-bottom:none; }
  .remedy .r-no { font-family:'Cormorant Garamond','Noto Serif Bengali',serif; font-feature-settings:'lnum' 1; font-size:26px; color:var(--gold); min-width:30px; }
  .remedy .r-title { font-family:'Marcellus','Noto Serif Bengali',serif; font-size:16.5px; color:var(--white); letter-spacing:0.3px; }
  .remedy .r-desc { font-size:14.5px; color:#BFBFD0; line-height:1.55; margin-top:3px; }
  .ty-inner { position:relative; z-index:2; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:110px 80px 70px; }
  .ty-namaste { font-family:'Cormorant Garamond','Noto Serif Bengali',serif; font-size:30px; color:var(--gold); }
  .ty-msg { font-size:17px; line-height:1.75; color:#D5D5E2; max-width:480px; margin-top:18px; }
`;

// ---------------------------------------------------------------------------

async function main() {
  await mkdir(OUT, { recursive: true });

  const html = buildHtml();
  const htmlPath = path.join(OUT, "assamese-sample.html");
  await writeFile(htmlPath, html, "utf8");
  console.log("HTML ->", htmlPath);

  const chrome = process.env.CHROME_PATH || SYSTEM_CHROME;
  if (!existsSync(chrome)) throw new Error(`Chrome not found at ${chrome}. Set CHROME_PATH.`);

  const browser = await puppeteer.launch({
    executablePath: chrome,
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--force-color-profile=srgb"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle0" });
  await page.evaluateHandle("document.fonts.ready");
  await page.waitForNetworkIdle({ idleTime: 400 }).catch(() => {});

  for (const id of ["cover", "mulank", "bhagyank", "loshu", "namenum", "year1", "year2", "lucky", "remedies", "thankyou"]) {
    const el = await page.$(`#${id}`);
    if (el) {
      const file = path.join(OUT, `as-${id}.png`);
      await el.screenshot({ path: file as `${string}.png` });
      console.log("PNG  ->", file);
    }
  }

  const pdfPath = path.join(OUT, "mysticdigits_report_benimadhab_gogoi_assamese.pdf");
  await page.pdf({ path: pdfPath, width: "794px", height: "1123px", printBackground: true });
  console.log("PDF  ->", pdfPath);

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
