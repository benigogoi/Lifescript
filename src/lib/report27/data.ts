/**
 * static knowledge for the 27-page test report.
 * See scripts/render-report27.ts.
 *
 * Compound-number names and fortunate/caution tones follow the traditional
 * Chaldean (Cheiro) system used in Indian name numerology; the descriptions
 * are written for Mystic Digits. Everything else is keyed by number 1–9.
 */
import type { Digit, Planet } from "../numerology";
import type { YearTier } from "../report-data";

export type Tone = "fortunate" | "neutral" | "caution";

export interface CompoundMeaning {
  name: string;
  tone: Tone;
  meaning: string;
}

/** Chaldean compound numbers 10–52 (totals above 52 are digit-summed back into range). */
export const COMPOUND: Record<number, CompoundMeaning> = {
  10: { name: "The Wheel of Fortune", tone: "fortunate", meaning: "Rises with faith and self-confidence — plans started with conviction tend to come round to success." },
  11: { name: "The Clenched Hand", tone: "caution", meaning: "Hidden tests and divided loyalties — progress comes through steady faith rather than trusting too quickly." },
  12: { name: "The Sacrifice", tone: "caution", meaning: "Tends to give more than it receives — firm boundaries keep goodwill from being used up by others." },
  13: { name: "Transformation", tone: "caution", meaning: "Upheaval that clears away the old — powerful when change is embraced, draining when it is resisted." },
  14: { name: "Movement", tone: "caution", meaning: "Travel, change and dealings with many people — rewarding, but it asks for care with risk and speculation." },
  15: { name: "The Magician", tone: "fortunate", meaning: "Magnetic and persuasive — draws gifts, favours and money through charm and eloquence." },
  16: { name: "The Shattered Tower", tone: "caution", meaning: "Warns of sudden reversals after success — plans need solid foundations and quiet humility." },
  17: { name: "The Star of the Magi", tone: "fortunate", meaning: "Peace and goodwill that outlast trials — a name that tends to be remembered well." },
  18: { name: "Material Conflict", tone: "caution", meaning: "A pull between material and higher aims — honest dealings and calm in disputes protect it." },
  19: { name: "The Prince of Heaven", tone: "fortunate", meaning: "Among the most fortunate numbers — success, esteem and happiness that grow with time." },
  20: { name: "The Awakening", tone: "neutral", meaning: "A call to a new purpose — material gain is slower, but inner direction becomes unusually clear." },
  21: { name: "The Crown of the Magi", tone: "fortunate", meaning: "Advancement and honour, usually after a long test — a steady rise to a secure place." },
  22: { name: "The Dreamer's Illusion", tone: "caution", meaning: "Warns of misplaced trust and false security — decisions need clear eyes and trusted advice." },
  23: { name: "The Royal Star of the Lion", tone: "fortunate", meaning: "Highly fortunate — help from people in authority and success in plans and partnerships." },
  24: { name: "Love and Assistance", tone: "fortunate", meaning: "Support from people of standing, and gains through love, creativity and good partnerships." },
  25: { name: "Strength Through Experience", tone: "fortunate", meaning: "Early trials build rare judgement — success arrives later and holds firm." },
  26: { name: "The Partnership Warning", tone: "caution", meaning: "Warns against bad advice and unequal partnerships — protect finances and choose allies carefully." },
  27: { name: "The Sceptre", tone: "fortunate", meaning: "Authority earned through intellect and original thought — creative work is rewarded." },
  28: { name: "Trust Tested", tone: "caution", meaning: "Great promise that can slip away through trusting blindly — build safeguards around what you build." },
  29: { name: "Grace Under Pressure", tone: "caution", meaning: "Uncertain allies and emotional trials — asks for discernment in relationships and deals." },
  30: { name: "Thoughtful Deduction", tone: "neutral", meaning: "Mental strength and independence — its results depend on how deliberately it is used." },
  31: { name: "The Recluse", tone: "neutral", meaning: "Self-contained and private — a rich inner life, though material rewards need conscious effort." },
  32: { name: "The Communicator", tone: "fortunate", meaning: "Persuasive speech and wide influence — fortunate when you hold to your own judgement." },
  33: { name: "Love and Assistance, Renewed", tone: "fortunate", meaning: "Carries the fortunate energy of 24 — creative gains and generous support from others." },
  34: { name: "Strength Through Experience, Renewed", tone: "fortunate", meaning: "Carries the energy of 25 — hard-won wisdom that turns into lasting success." },
  35: { name: "The Partnership Warning, Renewed", tone: "caution", meaning: "Carries the caution of 26 — guard against poor advice and risky alliances." },
  36: { name: "The Sceptre, Renewed", tone: "fortunate", meaning: "Carries the energy of 27 — recognition and authority through original ideas." },
  37: { name: "The Good Companion", tone: "fortunate", meaning: "Fortunate friendships, love and partnerships — people and luck tend to arrive together." },
  38: { name: "Grace Under Pressure, Renewed", tone: "caution", meaning: "Carries the caution of 29 — choose confidants and business partners with care." },
  39: { name: "Thoughtful Deduction, Renewed", tone: "neutral", meaning: "Carries the energy of 30 — sharp thinking whose results follow clear intent." },
  40: { name: "The Recluse, Renewed", tone: "neutral", meaning: "Carries the energy of 31 — independence and depth, with gains needing deliberate effort." },
  41: { name: "The Communicator, Renewed", tone: "fortunate", meaning: "Carries the energy of 32 — influence and success through words and ideas." },
  42: { name: "Love and Assistance, Returned", tone: "fortunate", meaning: "Echoes 24 — support, affection and creative gains." },
  43: { name: "Revolution", tone: "caution", meaning: "Upheaval and opposition — plans succeed only with patience and careful timing." },
  44: { name: "The Partnership Warning, Returned", tone: "caution", meaning: "Echoes 26 — protect resources and avoid rash partnerships." },
  45: { name: "The Sceptre, Returned", tone: "fortunate", meaning: "Echoes 27 — authority and reward for original, disciplined thought." },
  46: { name: "The Good Companion, Renewed", tone: "fortunate", meaning: "Echoes 37 — fortunate bonds and help through the right people." },
  47: { name: "Grace Under Pressure, Returned", tone: "caution", meaning: "Echoes 29 — trials with people call for discernment." },
  48: { name: "Thoughtful Deduction, Returned", tone: "neutral", meaning: "Echoes 30 — mental power that follows the direction you give it." },
  49: { name: "The Recluse, Returned", tone: "neutral", meaning: "Echoes 31 — inner strength that needs outward effort to show results." },
  50: { name: "The Communicator, Returned", tone: "fortunate", meaning: "Echoes 32 — success through speech, networks and ideas." },
  51: { name: "The Warrior", tone: "neutral", meaning: "Sudden advancement and strong drive — powerful, but it can stir rivals, so move with care." },
  52: { name: "Revolution, Renewed", tone: "caution", meaning: "Echoes 43 — change meets resistance; patience and timing decide the outcome." },
};

export const TONE_LABEL: Record<Tone, string> = {
  fortunate: "Fortunate",
  neutral: "Neutral",
  caution: "Needs care",
};

/** Customer-facing names for the Mulank-vs-number friendship tiers. */
export const TIER_LABEL: Record<YearTier, string> = {
  "Highly Favourable": "Harmonious",
  Favourable: "Supportive",
  Steady: "Neutral",
  Challenging: "Needs care",
};

export const TIER_CLASS: Record<YearTier, string> = {
  "Highly Favourable": "hf",
  Favourable: "fav",
  Steady: "steady",
  Challenging: "challenging",
};

export const TIER_TEXT: Record<YearTier, string> = {
  "Highly Favourable": "These numbers share a natural planetary friendship — they reinforce each other without effort.",
  Favourable: "These numbers support each other — cooperation comes easily with a little awareness.",
  Steady: "These numbers neither help nor hinder — the balance depends on how you use them.",
  Challenging: "These numbers pull in different directions — a creative tension that rewards conscious effort.",
};

export interface MoneyCore {
  para: string;
  do: string[];
  avoid: string[];
}

export const MONEY: Record<Digit, MoneyCore> = {
  1: {
    para: "Money comes to a 1 through ownership and visibility — income you control, a role with your name on it, a venture you lead. Salaried comfort rarely satisfies you for long. The risk is pride: refusing advice, spending to look successful, or backing a plan simply because it is yours. Build savings before status, and let one trusted adviser challenge your biggest moves.",
    do: ["Own something that earns — a venture, skill or asset", "Negotiate your worth instead of waiting for it", "Save a fixed amount before lifestyle spending"],
    avoid: ["Spending to impress", "Going all-in on untested ideas", "Refusing a second opinion"],
  },
  2: {
    para: "Money flows to a 2 through people — partnerships, trusted clients, steady employment and work built on care or service. Income can rise and fall like the tide, and feelings can drive spending. The answer is structure: automatic savings, big decisions made slowly, and never lending out of guilt. Your best gains come through a reliable partner or employer who values your loyalty.",
    do: ["Automate savings on payday", "Grow income through trusted partnerships", "Sleep on every big purchase"],
    avoid: ["Comfort spending when low", "Lending what you can't afford to lose", "Money with friends on vague terms"],
  },
  3: {
    para: "A 3 earns through knowledge and expression — teaching, advising, writing, speaking, or any work where people pay for your wisdom. Jupiter is the planet of expansion, so money tends to grow over time, often through reputation. The risk is generosity without limits and optimism that skips the numbers. Keep a budget that lets you give freely without giving away your security.",
    do: ["Earn from what you know — teach, consult, create", "Invest steadily for the long term", "Give generously, but on a budget"],
    avoid: ["Promising more than you've planned", "Lending on pure optimism", "Spreading money across too many ventures"],
  },
  4: {
    para: "Money for a 4 arrives in unconventional ways — technology, systems, sudden openings, work others overlook. Rahu can bring unexpected gains and equally unexpected losses, so wealth is built through discipline rather than luck. Keep an emergency fund larger than feels necessary, walk away from shortcuts that look too good, and let steady work compound.",
    do: ["Keep a generous emergency fund", "Earn through systems, tech or specialist skills", "Put every agreement in writing"],
    avoid: ["Speculation and quick-money schemes", "Signing without reading the terms", "Big purchases right after sudden gains"],
  },
  5: {
    para: "A 5 is a natural trader — sales, business, marketing, negotiation and several income streams suit you. Money moves quickly toward you and just as quickly away. Wealth grows when your speed is paired with a system: separate accounts, a savings rule you never break, and finishing one venture before funding the next.",
    do: ["Build more than one income stream", "Keep business and personal money apart", "Finish one venture before starting another"],
    avoid: ["Impulse buying", "Chasing every new opportunity", "Money scattered in untracked places"],
  },
  6: {
    para: "Money comes to a 6 through beauty, comfort and service — design, hospitality, fashion, homes, the arts, and any work that makes life more pleasant. Venus brings good taste, and good taste can be expensive. Gains are strongest through a shared family or partnership plan, and weakest when spending becomes a way of showing love.",
    do: ["Earn through creative or aesthetic skills", "Plan big family expenses together, in advance", "Buy things that hold their value"],
    avoid: ["Luxury spending on credit", "Paying for others to keep the peace", "Ignoring numbers to keep harmony"],
  },
  7: {
    para: "A 7 earns through depth — research, analysis, specialist knowledge, healing or spiritual work. Money is rarely your main motivation, which can leave finances neglected. Wealth grows quietly when you treat it as one more subject worth mastering: learn it, automate it, and keep it simple enough to run without your attention.",
    do: ["Become the specialist people pay more for", "Automate saving so it runs quietly", "Review finances on one fixed day a month"],
    avoid: ["Neglecting money as unimportant", "Trusting vague financial promises", "Big decisions with no second view"],
  },
  8: {
    para: "Saturn makes money slow but lasting for an 8. Early struggle is common, and rewards tend to arrive later — often larger than expected — through discipline, property, law, finance, industry or long-term work. The path to wealth is patience: consistent saving, low debt, and assets you can hold for decades.",
    do: ["Save and invest consistently for years", "Build assets — property, a business, skills", "Keep debt low and repay it early"],
    avoid: ["Shortcuts and quick money", "Borrowing to look successful", "Quitting just before the slow payoff"],
  },
  9: {
    para: "A 9 earns through energy and courage — leadership, defence, sport, medicine, engineering, property, or any field that rewards decisive action. Mars brings the drive to earn well and the temper to lose it fast. Wealth grows when big decisions wait a day, disputes are settled calmly, and part of every gain is set aside before celebrating.",
    do: ["Choose work that rewards decisive action", "Set aside part of every gain immediately", "Wait a day before any big money decision"],
    avoid: ["Decisions made in anger", "Money disputes with family", "Risky bets to prove a point"],
  },
};

/** Personal Month themes (Personal Year + calendar month, reduced). */
export const PERSONAL_MONTH: Record<Digit, { theme: string; line: string }> = {
  1: { theme: "Begin", line: "A month to start — launch the plan and take the first visible step." },
  2: { theme: "Connect", line: "A month for patience and people — listen, cooperate, let things mature." },
  3: { theme: "Express", line: "A month to speak up, create and be seen — ideas travel well now." },
  4: { theme: "Build", line: "A month for work and structure — organise, finish, lay foundations." },
  5: { theme: "Change", line: "A month of movement — expect news or a shift, and stay flexible." },
  6: { theme: "Care", line: "A month centred on home, family and responsibility." },
  7: { theme: "Reflect", line: "A quieter month for thinking, rest and planning before you act." },
  8: { theme: "Achieve", line: "A month for money, results and decisions — act with discipline." },
  9: { theme: "Complete", line: "A month to finish and release — close loops, clear space." },
};

/** What a number means when it appears twice, or three or more times, in the birth date. */
export const REPEATED: Record<Digit, { two: string; many: string }> = {
  1: { two: "Strong self-expression — you say what you mean and people take it seriously.", many: "Intense drive that can harden into stubbornness — practise listening before you decide." },
  2: { two: "Heightened intuition and a real gift for sensing what others feel.", many: "Deep sensitivity — protect yourself from carrying other people's moods." },
  3: { two: "A sharp, creative mind with a strong imagination.", many: "Ideas can outrun action — anchor them in simple written plans." },
  4: { two: "Strong discipline and practical, hands-on skill.", many: "Hard work can become rigidity — schedule rest and play as seriously as work." },
  5: { two: "High energy, adaptability and a love of freedom.", many: "Restlessness — commit to fewer, deeper goals." },
  6: { two: "Deep care for home, family and the people who depend on you.", many: "A tendency to worry for everyone — let others carry their own load." },
  7: { two: "Inner wisdom, often gained through experience.", many: "Lessons that come through letting go — lean on faith and good counsel." },
  8: { two: "Sound judgement with money and material matters.", many: "Pressure to control outcomes — ease up and trust the process." },
  9: { two: "Idealism, courage and a strong sense of right.", many: "A critical streak — lead with compassion as much as conviction." },
};

/** A practical way to steer each repeated number. */
export const REPEATED_CHANNEL: Record<Digit, string> = {
  1: "Channel it: lead one project fully instead of pushing every opinion.",
  2: "Channel it: trust your intuition in decisions, and set a daily time to switch off from others' needs.",
  3: "Channel it: pick one idea a week and take one concrete step on it.",
  4: "Channel it: put your discipline into one long-term goal, and schedule real rest.",
  5: "Channel it: move your body daily and limit how many new things you start at once.",
  6: "Channel it: care generously, but say one kind no each week.",
  7: "Channel it: write down what each setback taught you — your wisdom grows fastest on paper.",
  8: "Channel it: plan money and goals for the long term, and delegate the rest.",
  9: "Channel it: put your courage behind a cause, and pause before criticising.",
};

export const SPELLING_RULES = [
  "Its number is friendly with your Mulank or Bhagyank",
  "It is in tension with neither of them",
  "Its compound vibration is fortunate or neutral",
  "Only a small change to your first or middle name — your surname never changes",
];

/** A simple, traditional remedy for each number missing from the Lo Shu grid. */
export const MISSING_REMEDY: Record<Digit, string> = {
  1: "Take a few minutes of morning sunlight and keep a copper or gold-toned item with you.",
  2: "Keep a silver item close and spend quiet time near water on Mondays.",
  3: "Wear yellow on Thursdays and keep a yellow cloth or book at your study or work desk.",
  4: "Follow a fixed daily routine and keep your workspace orderly — structure fills this gap.",
  5: "Keep a green plant at your desk and wear green on Wednesdays.",
  6: "Keep fresh flowers or a gentle fragrance at home and wear white or light pink on Fridays.",
  7: "Sit in silence or meditation for ten minutes a day, ideally at the same time.",
  8: "Serve elders or workers on Saturdays and keep bills and payments on time.",
  9: "Exercise regularly and wear red on Tuesdays to channel Mars energy well.",
};

/** Body areas traditionally associated with each planet (general wellbeing, not medical advice). */
export const BODY_AREAS: Record<Planet, string[]> = {
  Sun: ["Heart and circulation", "Eyes", "Spine and posture", "Overall vitality"],
  Moon: ["Mind and emotions", "Sleep", "Digestion", "Body fluids"],
  Jupiter: ["Liver", "Weight and metabolism", "Energy levels", "Recovery"],
  Rahu: ["Nerves and sudden stress", "Skin", "Sleep patterns", "Mental restlessness"],
  Mercury: ["Nervous system", "Skin", "Breath", "Speech and focus"],
  Venus: ["Kidneys", "Throat", "Hormonal balance", "Skin"],
  Ketu: ["Immunity", "Nerves", "Unexplained fatigue", "Digestion"],
  Saturn: ["Bones and joints", "Teeth", "Stamina", "Long-term fatigue"],
  Mars: ["Blood and energy", "Muscles", "Inflammation", "Injuries from haste"],
};

export const ENERGY_HABITS = [
  "Regular sleep and wake times",
  "Daily movement you actually enjoy",
  "A few minutes of pranayama",
  "Morning sunlight and fresh air",
];

export const WELCOME_SECTIONS = [
  { pages: "Pages 3–8", title: "Your Numbers", text: "Your Mulank, Bhagyank and Name Number — and how the three work together." },
  { pages: "Pages 9–10", title: "Your Name", text: "Whether your full name is aligned with your birth numbers, with spelling options if it isn't." },
  { pages: "Pages 11–14", title: "Your Chart", text: "Your Lo Shu grid, its eight planes, and what your missing and repeated numbers mean." },
  { pages: "Pages 15–19", title: "Your Life", text: "Career, money, love, compatibility and health, read through your numbers." },
  { pages: "Pages 20–23", title: "Your Time", text: "2026 and 2027, your Personal Year, and a guide to the next three months." },
  { pages: "Pages 24–26", title: "Luck & Remedies", text: "Lucky elements, your mantra, simple remedies and a personal action plan." },
];

export const METHOD_NOTE =
  "How this report is calculated: your Mulank comes from your birth day, your Bhagyank from your full date of birth, your name numbers from the Chaldean letter system used in Indian numerology, and your Lo Shu grid from the digits of your birth date. The next page shows the working for each.";

export const SIGNATURE_TIPS = [
  "Sign with your first name, not just initials",
  "Let the signature rise gently from left to right",
  "Avoid lines that cut through your name",
  "Keep it clear and easy to read",
];

export const ADOPT_STEPS = [
  "Use it in your signature",
  "Update your email and social media display name",
  "Use it on WhatsApp and business cards",
  "Write and say it the same way everywhere",
];

export const ADOPT_NOTES = [
  "Numerology works through the name you use daily",
  "Official documents are your choice, never required",
  "Traditionally given 40 days of consistent use",
  "Small changes keep your name recognisable",
];
