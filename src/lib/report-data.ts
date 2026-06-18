/**
 * LifeScript — Numerology knowledge base.
 *
 * Deterministic reference data keyed by number 1–9. The narrative `core`
 * fields are concise placeholders the template weaves into prose; they are
 * the seam the Claude content engine will later replace/enrich. The LUCKY
 * and REMEDY tables are factual planetary correspondences and stay as-is.
 */
import type { Digit, Planet } from "./numerology";

export interface NumberCore {
  planetSanskrit: string;
  /** one-line archetype, e.g. "the leader" */
  archetype: string;
  /** Mulank (personality) */
  mulankEssence: string;
  mulankParas: [string, string, string];
  strengths: string[];
  growth: string[];
  /** Bhagyank (destiny) */
  bhagyankEssence: string;
  bhagyankParas: [string, string, string];
  destinyFavours: string[];
  destinyAsks: string[];
  /** Name number */
  nameEssence: string;
  nameParas: [string, string, string];
  nameGives: string[];
  nameUseWisely: string[];
  /** Lo Shu: what this number means when MISSING from the chart */
  missingNote: string;
}

export interface YearCore {
  theme: string; // page title
  essence: string;
  paras: [string, string, string];
  opportunities: string[];
  takeCare: string[];
}

export interface LuckyColor {
  name: string;
  hex: string;
}
export interface Lucky {
  days: string;
  colors: LuckyColor[];
  numbers: string;
  gemstone: string;
  metal: string;
  direction: string;
}

export interface Remedy {
  title: string;
  desc: string;
}
export interface Remedies {
  mantra: string;
  mantraSub: string;
  items: Remedy[];
}

export const PLANET_SANSKRIT: Record<Planet, string> = {
  Sun: "Surya",
  Moon: "Chandra",
  Jupiter: "Brihaspati",
  Rahu: "Rahu",
  Mercury: "Budh",
  Venus: "Shukra",
  Ketu: "Ketu",
  Saturn: "Shani",
  Mars: "Mangal",
};

export const NUMBER_CORE: Record<Digit, NumberCore> = {
  1: {
    planetSanskrit: "Surya · the Sun",
    archetype: "the leader",
    mulankEssence: "The number of the leader — radiant, original, and built to stand at the front of things.",
    mulankParas: [
      "your Mulank is 1 — the number of beginnings, governed by the Sun itself. Just as the Sun does not ask permission to rise, you carry an inner authority that others sense before you speak. You were not made to follow a path laid by someone else; you were made to lay one.",
      "Your strength is independence and clarity of will. When you decide, you move, and people are drawn to that certainty. The lesson of 1 is to lead without standing alone — when pride softens into generosity, your light does not just shine, it warms.",
      "In daily life, this often looks like being first to speak up in a meeting, first to volunteer for the role no one else wants, first to suggest the idea everyone was quietly thinking. People around you don't always notice they are following your lead — they just notice that, somehow, things start moving once you're in the room.",
    ],
    strengths: ["Natural leadership and initiative", "Strong willpower and self-belief", "Creative, original thinking", "Warmth that inspires loyalty"],
    growth: ["Learning patience with others", "Asking for help without shame", "Softening pride into humility", "Resting before you burn out"],
    bhagyankEssence: "A destiny of leadership — life keeps placing you where someone must go first.",
    bhagyankParas: [
      "your Bhagyank is 1, ruled by the Sun. Life repeatedly hands you the front seat: the decision no one else will make, the path no one has walked. Your fate is tied to originality and self-reliance.",
      "Recognition comes when you trust your own vision over the crowd's. The destiny of 1 rewards courage and punishes hesitation — your road rises the moment you stop waiting for permission.",
      "Practically, this often means your biggest breakthroughs arrive through ventures that carry your name directly — a business you start, a role you create rather than inherit, a reputation built one bold decision at a time. Borrowed paths rarely hold your interest for long.",
    ],
    destinyFavours: ["Pioneering and self-employment", "Leadership and authority", "Original ideas and invention", "Building your own name"],
    destinyAsks: ["Trust your own judgement", "Don't wait for permission", "Lead with humility", "Finish what you pioneer"],
    nameEssence: "A name of authority and presence — people feel your confidence before you speak.",
    nameParas: [
      "vibrates to 1, ruled by the Sun. This is the energy people meet first: confident, distinct, hard to ignore. Your name itself carries the charge of a leader.",
      "A 1 name opens doors in any field that rewards standing out. Use it to lead and to build a brand around yourself — just guard against letting confidence harden into ego.",
      "In a room full of strangers, this is the name that gets remembered after one introduction. It works especially well in interviews, pitches, and any moment where the first impression decides how seriously you'll be taken.",
    ],
    nameGives: ["A commanding first impression", "Confidence and visibility", "A strong personal brand", "Natural authority"],
    nameUseWisely: ["Lead, don't dominate", "Listen as much as you speak", "Share the credit", "Stay approachable"],
    missingNote: "1 — strengthen self-belief and the courage to lead",
  },
  2: {
    planetSanskrit: "Chandra · the Moon",
    archetype: "the peacemaker",
    mulankEssence: "The number of the peacemaker — intuitive, gentle, and deeply attuned to others.",
    mulankParas: [
      "your Mulank is 2, ruled by the Moon. You feel what others feel, often before they say it. Your power is not force but harmony — you sense the mood of a room and quietly set it right.",
      "Sensitivity is your gift and your test. The same softness that makes you a wonderful partner and friend can make you absorb others' moods too deeply. Learn to protect your peace, and your gentleness becomes unshakeable strength.",
      "In daily life, this shows up as the friend who notices the tension in the room before anyone names it, the one who checks in without being asked. You read silences as easily as words, and that quiet attentiveness is often the reason people feel safest confiding in you.",
    ],
    strengths: ["Deep empathy and intuition", "A natural gift for harmony", "Loyalty in relationships", "Patience and diplomacy"],
    growth: ["Guarding against over-sensitivity", "Making decisions with confidence", "Not absorbing others' moods", "Speaking your own needs"],
    bhagyankEssence: "A destiny of partnership — your path unfolds through people, not alone.",
    bhagyankParas: [
      "your Bhagyank is 2, ruled by the Moon. Your fate is relational: the right partnerships, alliances, and bonds carry you further than solo effort ever could.",
      "Success arrives through cooperation, sensitivity, and timing. The destiny of 2 asks you to trust the slow, tidal rhythm of things rather than forcing outcomes.",
      "Practically, your best opportunities tend to arrive through someone else first — a referral, a trusted introduction, a partnership offered because you were the one who listened. Chasing alone rarely works as well for you as being chosen.",
    ],
    destinyFavours: ["Partnerships and collaboration", "Counselling and care", "Creative and intuitive work", "Behind-the-scenes influence"],
    destinyAsks: ["Choose partners wisely", "Trust patience over force", "Value your own needs too", "Let bonds mature slowly"],
    nameEssence: "A gentle, approachable name — people feel safe around you quickly.",
    nameParas: [
      "vibrates to 2, ruled by the Moon. Your name carries warmth and approachability; people open up to you with ease.",
      "A 2 name suits any work built on trust and relationship. Its only caution is to not let the wish to please erase your own voice.",
      "On a first meeting, this is the name that puts people at ease within minutes. It serves you well in any role where trust has to be earned quickly — counselling, hospitality, care, or simply being the person a team turns to first.",
    ],
    nameGives: ["Warmth and approachability", "Trust that forms fast", "A calming presence", "Skill in mediation"],
    nameUseWisely: ["Keep your own boundaries", "Don't over-please", "Stand firm when needed", "Protect your energy"],
    missingNote: "2 — nurture patience, intuition and gentle cooperation",
  },
  3: {
    planetSanskrit: "Brihaspati · Jupiter",
    archetype: "the expressive one",
    mulankEssence: "The number of expression — optimistic, creative, and full of life.",
    mulankParas: [
      "your Mulank is 3, ruled by Jupiter. You are a natural communicator and creator, blessed with optimism that lifts everyone near you. Words, art, and ideas flow through you easily.",
      "Jupiter gives you wisdom and luck, but 3 can scatter its gifts across too many interests. Focus your creativity, and your expression turns from charming to genuinely influential.",
      "In daily life, this looks like turning a flat conversation into a story everyone leans in for, or making a dry presentation land because of how you say it, not just what you say. Your energy is often the thing people remember about a gathering long after the details fade.",
    ],
    strengths: ["Creativity and self-expression", "Natural optimism", "Easy communication", "A magnetic, joyful presence"],
    growth: ["Focusing your many talents", "Following through to the end", "Taking things seriously when needed", "Managing scattered energy"],
    bhagyankEssence: "A destiny of expression — you are meant to be seen, heard, and to inspire.",
    bhagyankParas: [
      "your Bhagyank is 3, ruled by Jupiter. Your path rewards creativity, teaching, and communication — you grow by sharing your voice with the world.",
      "Fortune favours you when you express rather than withhold. The destiny of 3 expands through optimism, learning, and generosity of spirit.",
      "Practically, your path tends to open through being visible — sharing the idea publicly, teaching what you know, putting your voice out rather than keeping it for yourself. The opportunities that matter rarely find you in silence.",
    ],
    destinyFavours: ["Creative and artistic fields", "Teaching and speaking", "Writing and media", "Inspiring and uplifting others"],
    destinyAsks: ["Finish what you start", "Focus your gifts", "Use words to build, not scatter", "Stay disciplined with luck"],
    nameEssence: "A bright, memorable name — it carries optimism and creative spark.",
    nameParas: [
      "vibrates to 3, ruled by Jupiter. Your name feels lively and expressive; it makes people smile and remember you.",
      "A 3 name shines in any creative or public-facing path. Channel its energy and it becomes a true asset rather than mere charm.",
      "Said aloud, this name has a lift to it — people respond warmly even before they know you. It works in your favour anywhere first impressions are made through words: pitches, performances, introductions, interviews.",
    ],
    nameGives: ["A memorable, bright impression", "Creative magnetism", "Ease in communication", "An uplifting presence"],
    nameUseWisely: ["Back charm with substance", "Don't over-promise", "Stay focused", "Follow through"],
    missingNote: "3 — cultivate expression, creativity and optimism",
  },
  4: {
    planetSanskrit: "Rahu",
    archetype: "the builder",
    mulankEssence: "The number of the builder — practical, disciplined, and quietly unconventional.",
    mulankParas: [
      "your Mulank is 4, influenced by Rahu. You are the one who builds things that last — methodical, reliable, and grounded. Yet beneath the steadiness runs an original, rule-bending streak.",
      "Your strength is patience and hard work; your test is rigidity and resistance to change. When you balance structure with openness, you build not just solidly, but brilliantly.",
      "In daily life, this shows up as the one who actually finishes the spreadsheet, follows through on the plan, and quietly keeps a system running that everyone else has forgotten exists. People may not notice your work in the moment, but they certainly notice when it's missing.",
    ],
    strengths: ["Discipline and reliability", "Practical problem-solving", "Strong work ethic", "An unconventional mind"],
    growth: ["Embracing change", "Loosening rigidity", "Trusting beyond logic", "Resting from overwork"],
    bhagyankEssence: "A destiny of building — lasting success comes through patience and effort.",
    bhagyankParas: [
      "your Bhagyank is 4, influenced by Rahu. Your fate is built brick by brick; sudden shortcuts rarely serve you, but steady effort compounds into something remarkable.",
      "The destiny of 4 rewards persistence and honest work, often after delay. What you build slowly, you keep.",
      "Practically, your biggest gains tend to come from compounding — the steady habit, the disciplined years, the structure built when no one was watching. What looks slow to others is, for you, simply the only path that actually holds weight long-term.",
    ],
    destinyFavours: ["Engineering and systems", "Real estate and structure", "Long-term ventures", "Disciplined craftsmanship"],
    destinyAsks: ["Stay patient through delays", "Adapt when needed", "Avoid stubbornness", "Trust the slow build"],
    nameEssence: "A grounded, dependable name — it signals stability and substance.",
    nameParas: [
      "vibrates to 4, influenced by Rahu. Your name reads as solid and trustworthy; people sense they can rely on you.",
      "A 4 name suits work built on competence and consistency. Its caution is to not seem too rigid or closed.",
      "On paper and in person, this name reads as someone who can be handed responsibility without supervision. It earns you trust early in any role built on competence — finance, operations, engineering, or anywhere reliability is the real currency.",
    ],
    nameGives: ["An impression of reliability", "Trust and credibility", "A grounded presence", "Quiet strength"],
    nameUseWisely: ["Show some flexibility", "Stay open to new ideas", "Don't seem unapproachable", "Let warmth through"],
    missingNote: "4 — build patience, order and steady discipline",
  },
  5: {
    planetSanskrit: "Budh · Mercury",
    archetype: "the communicator",
    mulankEssence: "The number of freedom — quick, adaptable, and endlessly curious.",
    mulankParas: [
      "your Mulank is 5, ruled by Mercury. You are quick, versatile, and curious, made for movement and change. You learn fast, adapt faster, and rarely stay stuck for long.",
      "Freedom is your oxygen, but unchecked it becomes restlessness and half-finished starts. Channel Mercury into focus, and your adaptability turns into real momentum.",
      "In daily life, this shows up as the friend who already knows people in any new city, who picks up new skills faster than expected, and who gets restless if a week looks exactly like the one before it. Variety isn't a distraction for you — it's closer to fuel.",
    ],
    strengths: ["Sharp, quick intelligence", "Adaptability to change", "Communication and wit", "A spirit of adventure"],
    growth: ["Finishing what you begin", "Avoiding restlessness", "Committing fully", "Slowing down to reflect"],
    bhagyankEssence: "A destiny of change and movement — variety, travel, and communication shape your path.",
    bhagyankParas: [
      "your Bhagyank is 5, ruled by Mercury. Your fate resists the fixed and rewards the flexible — commerce, communication, and travel keep opening doors.",
      "The destiny of 5 thrives on adaptability. Just anchor your freedom to a purpose, or it scatters into motion without direction.",
      "Practically, your path tends to widen through movement — a new city, a new role, a conversation with a stranger that turns into an opportunity. Staying too long in one lane is usually what slows you down, not what protects you.",
    ],
    destinyFavours: ["Business and trade", "Communication and media", "Travel and variety", "Sales and networking"],
    destinyAsks: ["Anchor freedom to purpose", "Finish before moving on", "Avoid impulsiveness", "Build something lasting"],
    nameEssence: "A quick, magnetic name — it carries energy, charm, and movement.",
    nameParas: [
      "vibrates to 5, ruled by Mercury. This is the energy people feel: quick, curious, adaptable, and easy to talk to.",
      "A 5 name is a gift for communication, networking, and commerce. Its only caution is restlessness — turn talk into action and it becomes powerful.",
      "In conversation, this name carries a quickness people respond to instantly — it suits introductions, negotiations, and any first exchange where wit and adaptability open doors faster than credentials do.",
    ],
    nameGives: ["Sharp communication skills", "Adaptability and quick wit", "A natural flair for business", "Magnetism in conversation"],
    nameUseWisely: ["Finish what you begin", "Avoid scattering energy", "Turn talk into action", "Guard against restlessness"],
    missingNote: "5 — develop focus, balance and steady direction",
  },
  6: {
    planetSanskrit: "Shukra · Venus",
    archetype: "the nurturer",
    mulankEssence: "The number of love, beauty, and responsibility — one who builds harmony around them.",
    mulankParas: [
      "your Mulank is 6, ruled by Venus. You are the heart of every home and circle you join — caring, artistic, and responsible. People feel safer and warmer in your presence.",
      "Your gift is love freely given; your test is over-giving until little is left for you. Learn to receive as gracefully as you give, and your warmth becomes a renewable light.",
      "In daily life, this shows up as the one who remembers everyone's birthday, who notices when a room needs better lighting or a kinder word, and who ends up hosting more often than they meant to. People gravitate to your spaces because something in them feels cared for.",
    ],
    strengths: ["A caring, nurturing nature", "An eye for beauty and art", "Deep sense of responsibility", "Loyalty and devotion"],
    growth: ["Setting loving boundaries", "Avoiding people-pleasing", "Letting others care for you", "Choosing peace over perfection"],
    bhagyankEssence: "A destiny of harmony — life places you at the centre of homes and communities that need holding together.",
    bhagyankParas: [
      "your Bhagyank is 6, ruled by Venus. Your fate runs along the road of relationships, beauty, and care; you build success through people who trust you.",
      "Comfort, art, and affection are not distractions for you — they are your path. The destiny of 6 asks you to love without losing yourself.",
      "Practically, your path often grows through the people you choose to look after — a family business, a close circle that becomes a client base, loyalty that compounds into opportunity over years. What you build through care tends to outlast what others build through ambition alone.",
    ],
    destinyFavours: ["Family, home and community", "Art, design and beauty", "Counselling and caregiving", "Loyal, lasting relationships"],
    destinyAsks: ["Set loving boundaries", "Avoid people-pleasing", "Let others care for you too", "Choose peace over perfection"],
    nameEssence: "A warm, harmonious name — it draws people in and signals care.",
    nameParas: [
      "vibrates to 6, ruled by Venus. Your name carries warmth, beauty, and a sense of responsibility that people instinctively trust.",
      "A 6 name suits anything built on care, beauty, or relationships. Its caution is to not carry everyone at your own expense.",
      "On meeting someone new, this name lands as warm and dependable — useful in any field where people need to feel safe before they commit: design, hospitality, healthcare, or simply being the one a team trusts to hold things together.",
    ],
    nameGives: ["A warm, trustworthy impression", "Aesthetic charm", "A nurturing presence", "Deep likeability"],
    nameUseWisely: ["Protect your own energy", "Don't over-commit to others", "Receive as well as give", "Keep some space for you"],
    missingNote: "6 — nurture home, relationships and balance",
  },
  7: {
    planetSanskrit: "Ketu",
    archetype: "the seeker",
    mulankEssence: "The number of the seeker — thoughtful, spiritual, and quietly deep.",
    mulankParas: [
      "your Mulank is 7, influenced by Ketu. You are a thinker and a seeker, drawn to the meaning beneath the surface of things. Solitude restores you; depth attracts you.",
      "Your gift is insight and intuition; your test is isolation and overthinking. When you balance reflection with connection, your inner depth becomes a source of wisdom for others.",
      "In daily life, this shows up as the one who needs a real reason before agreeing with the room, who would rather spend an evening alone with a good question than at a loud gathering, and who often notices what everyone else missed. Your depth isn't antisocial — it's selective.",
    ],
    strengths: ["Deep, analytical mind", "Spiritual insight", "Independence of thought", "Intuition and perception"],
    growth: ["Avoiding isolation", "Trusting people more", "Quieting overthinking", "Sharing your inner world"],
    bhagyankEssence: "A destiny of depth — your path leads inward, toward wisdom, research, or the spiritual.",
    bhagyankParas: [
      "your Bhagyank is 7, influenced by Ketu. Your fate is not loud success but deep mastery; you grow through study, reflection, and inner work.",
      "The destiny of 7 rewards authenticity over approval. Trust your unusual path — it leads somewhere most never reach.",
      "Practically, your path tends to reward specialised knowledge over broad popularity — the niche you mastered quietly, the research no one else bothered to finish, the unconventional choice that took years to be understood. Recognition, for you, usually arrives late but lasts.",
    ],
    destinyFavours: ["Research and analysis", "Spirituality and philosophy", "Specialised expertise", "Solitary, focused work"],
    destinyAsks: ["Don't isolate too far", "Share your insight", "Trust your unusual path", "Balance mind and heart"],
    nameEssence: "A quietly distinctive name — it suggests depth and mystery.",
    nameParas: [
      "vibrates to 7, influenced by Ketu. Your name carries a thoughtful, slightly mysterious quality that intrigues people.",
      "A 7 name suits scholarly, spiritual, or specialised paths. Its caution is to not seem distant or hard to reach.",
      "On a first meeting, this name carries a quiet intrigue — people sense there's more beneath the surface and want to learn what it is. It suits work where expertise speaks louder than charm: research, strategy, writing, or any specialised craft.",
    ],
    nameGives: ["An impression of depth", "Intellectual intrigue", "A calm, wise presence", "Distinctiveness"],
    nameUseWisely: ["Stay approachable", "Let people in", "Share your thinking", "Don't seem aloof"],
    missingNote: "7 — make room for faith, study and reflection",
  },
  8: {
    planetSanskrit: "Shani · Saturn",
    archetype: "the achiever",
    mulankEssence: "The number of power and karma — ambitious, disciplined, and built for the long game.",
    mulankParas: [
      "your Mulank is 8, ruled by Saturn. You are ambitious and resilient, made to handle responsibility and build material success. Saturn tests you early but rewards you deeply.",
      "Your strength is endurance and authority; your test is rigidity and the weight you carry alone. When you pair discipline with patience and fairness, you rise to lasting power.",
      "In daily life, this shows up as the one who takes on the responsibility no one else wants, who keeps working after the room has gone home, and who measures a day by what got built, not how it felt. Saturn rarely lets you coast, but it never forgets what you've earned either.",
    ],
    strengths: ["Ambition and drive", "Discipline and endurance", "Executive ability", "Resilience through hardship"],
    growth: ["Softening rigidity", "Sharing the load", "Patience with slow results", "Balancing work and life"],
    bhagyankEssence: "A destiny of achievement — material success comes through patience, structure, and karma.",
    bhagyankParas: [
      "your Bhagyank is 8, ruled by Saturn. Your fate is built through discipline and time; Saturn delays but does not deny what you truly earn.",
      "The destiny of 8 rewards integrity and hard work, often after struggle. What you build with fairness becomes solid and enduring.",
      "Practically, your biggest results tend to arrive on a longer timeline than you'd like — the promotion after the hard years, the wealth after the discipline, the respect after the setbacks you didn't quit through. What Saturn delays, it delivers in full.",
    ],
    destinyFavours: ["Business and finance", "Authority and management", "Long-term wealth building", "Structure and systems"],
    destinyAsks: ["Stay patient through delays", "Act with integrity", "Avoid ruthlessness", "Persevere past setbacks"],
    nameEssence: "A weighty, authoritative name — it signals seriousness and capability.",
    nameParas: [
      "vibrates to 8, ruled by Saturn. Your name carries gravity and authority; people take you seriously.",
      "An 8 name suits business, finance, and leadership. Its caution is to not feel cold — let some warmth balance the weight.",
      "On paper, this name carries weight before you've said a word — people assume competence and hand over responsibility accordingly. It serves you well in finance, law, management, or anywhere seriousness is read as capability.",
    ],
    nameGives: ["An authoritative impression", "Credibility and gravity", "A capable presence", "Respect"],
    nameUseWisely: ["Add warmth to authority", "Don't seem harsh", "Be fair and approachable", "Soften the seriousness"],
    missingNote: "8 — develop discipline, patience and material focus",
  },
  9: {
    planetSanskrit: "Mangal · Mars",
    archetype: "the warrior",
    mulankEssence: "The number of the warrior — courageous, passionate, and driven to act.",
    mulankParas: [
      "your Mulank is 9, ruled by Mars. You are bold, energetic, and unafraid of a fight worth having. Courage and passion run hot in you; you act where others hesitate.",
      "Your strength is drive and protectiveness; your test is anger and impatience. When you aim your fire at a purpose larger than yourself, you become a force for genuine good.",
      "In daily life, this shows up as the one who acts while others are still discussing, who stands up first when something is unfair, and who finds it almost impossible to stay quiet about a cause they believe in. Your energy reads as intensity, but underneath it is almost always protection.",
    ],
    strengths: ["Courage and determination", "High energy and drive", "Protective loyalty", "Passion and conviction"],
    growth: ["Managing anger", "Cultivating patience", "Channelling energy wisely", "Thinking before acting"],
    bhagyankEssence: "A destiny of action and service — your path calls for courage used in a larger cause.",
    bhagyankParas: [
      "your Bhagyank is 9, ruled by Mars. Your fate rewards courage and decisive action, especially in service of others or a cause greater than yourself.",
      "The destiny of 9 is generous and humanitarian beneath the fire. Aim your energy well, and you leave things better than you found them.",
      "Practically, your path tends to open through standing for something larger than personal gain — a cause, a team, a fight worth having. Mars rewards you most when your courage serves more than just yourself.",
    ],
    destinyFavours: ["Leadership in action", "Service and causes", "Sports, defence, surgery", "Pioneering, high-energy work"],
    destinyAsks: ["Channel anger into purpose", "Act with patience", "Serve, don't just conquer", "Protect without dominating"],
    nameEssence: "A bold, energetic name — it radiates strength and passion.",
    nameParas: [
      "vibrates to 9, ruled by Mars. Your name carries force and intensity; people feel your strength and conviction.",
      "A 9 name suits dynamic, courageous paths. Its caution is to not come across as aggressive — let warmth temper the fire.",
      "On first meeting, this name carries an unmistakable charge — people sense conviction before you've made your case. It serves you well in leadership, advocacy, sport, or any field that rewards decisive, courageous action.",
    ],
    nameGives: ["A strong, dynamic impression", "An aura of courage", "A commanding energy", "Passionate presence"],
    nameUseWisely: ["Temper force with warmth", "Avoid seeming aggressive", "Channel intensity well", "Lead with heart"],
    missingNote: "9 — channel courage, energy and compassion",
  },
};

export const YEAR_CORE: Record<Digit, YearCore> = {
  1: {
    theme: "A Year to Begin Again",
    essence: "reduces to 1 — a year of fresh starts, bold moves, and planting seeds you will harvest for nine years.",
    paras: [
      "is a number 1 year for you — a year of beginnings ruled by the Sun. Whatever you start now carries unusual power and sets the tone for the cycle ahead.",
      "This is the year to launch the thing you have been hesitating on. The cosmos favours initiative now, not caution. Take the lead and put your name on it.",
      "Health-wise, a new habit tends to stick more easily this year, since everything else around you is also being rebuilt — good timing to start the routine you've postponed. In relationships, be honest early about the new direction you're taking; the right people will move with you.",
    ],
    opportunities: ["New ventures and fresh starts", "Stepping into leadership", "Reinventing your image", "Strong months: March, July, October"],
    takeCare: ["Don't act purely on ego", "Pace yourself — avoid burnout", "Keep allies close", "Quieter months: May, August"],
  },
  2: {
    theme: "A Year to Build Bonds",
    essence: "reduces to 2 — a gentler year of patience, partnership, and emotional depth.",
    paras: [
      "is a number 2 year for you, ruled by the Moon — soft, intuitive, relational. The seeds of last year now need patience and care rather than force.",
      "Relationships take centre stage: a deepening bond, a key collaboration, a reconciliation. Listen more than you push, and your sensitivity becomes a quiet strength.",
      "Health-wise, stress tends to show up emotionally before it shows up physically this year — make space for rest, not just productivity. In career, your value is more likely to be recognised through quiet consistency than through bold announcements.",
    ],
    opportunities: ["Partnerships and collaborations", "Deepening close relationships", "Patience that pays off", "Strong months: February, June, November"],
    takeCare: ["Avoid impatience and forcing", "Mind emotional ups and downs", "Don't take things personally", "Quieter months: April, September"],
  },
  3: {
    theme: "A Year to Express Yourself",
    essence: "reduces to 3 — a bright, creative year of expression, joy, and social expansion.",
    paras: [
      "is a number 3 year for you, ruled by Jupiter — expansive and optimistic. Creativity, communication, and social life all open up now.",
      "Say yes to visibility this year: share your work, your voice, your ideas. Just keep your many sparks focused, or the year scatters its gifts.",
      "Health-wise, watch the tendency to overfill your calendar just because invitations keep arriving — joy needs rest too. In career, this is an excellent year to put yourself forward for visibility you've been putting off.",
    ],
    opportunities: ["Creative projects and visibility", "Growing your social circle", "Communication and learning", "Strong months: March, June, December"],
    takeCare: ["Don't scatter your energy", "Finish what you start", "Avoid over-spending", "Quieter months: May, October"],
  },
  4: {
    theme: "A Year to Build Foundations",
    essence: "reduces to 4 — a grounded year of work, structure, and laying solid foundations.",
    paras: [
      "is a number 4 year for you, a year of steady building. Progress is made brick by brick now; discipline matters more than inspiration.",
      "Put systems in place, handle the practical, and do the unglamorous work. What you build carefully this year will hold for a long time.",
      "Health-wise, this is a year to protect your body from the cost of overwork — let discipline include rest, not just effort. In relationships, steady reliability matters more now than grand gestures.",
    ],
    opportunities: ["Building stable foundations", "Career and financial structure", "Hard work that compounds", "Strong months: April, August, January"],
    takeCare: ["Don't resist necessary change", "Avoid overwork and rigidity", "Be patient with slow progress", "Quieter months: June, November"],
  },
  5: {
    theme: "A Year of Change",
    essence: "reduces to 5 — a fast, dynamic year of change, freedom, and new horizons.",
    paras: [
      "is a number 5 year for you, ruled by Mercury — restless and full of movement. Expect change, travel, and unexpected opportunities.",
      "Stay flexible and curious; rigidity is your only enemy now. Embrace the new, but anchor your freedom to a purpose so the year builds rather than scatters.",
      "Health-wise, irregular routines can catch up with you this year — anchor at least one daily habit even amid the change. In relationships, be honest about your need for freedom rather than disappearing without explanation.",
    ],
    opportunities: ["Travel and new experiences", "Career moves and pivots", "Networking and fresh starts", "Strong months: May, September, February"],
    takeCare: ["Avoid impulsive decisions", "Don't overcommit", "Stay grounded amid change", "Quieter months: July, December"],
  },
  6: {
    theme: "A Year of Love and Home",
    essence: "reduces to 6 — a warm year centred on home, love, family, and responsibility.",
    paras: [
      "is a number 6 year for you, ruled by Venus — tender and home-centred. Family, love, and the people you care for take priority now.",
      "This is a year for commitments, beautifying your world, and healing relationships. Give generously, but remember to receive and rest too.",
      "Health-wise, caregiving can quietly drain you this year — schedule rest as deliberately as you schedule everyone else's needs. In career, opportunities tied to your reputation for trustworthiness are likely to surface.",
    ],
    opportunities: ["Love and commitment", "Home and family harmony", "Beauty, art, and comfort", "Strong months: June, October, March"],
    takeCare: ["Don't carry everyone alone", "Avoid over-giving", "Keep some space for yourself", "Quieter months: August, January"],
  },
  7: {
    theme: "A Year of Reflection",
    essence: "reduces to 7 — an inward year of reflection, learning, and spiritual depth.",
    paras: [
      "is a number 7 year for you, influenced by Ketu — quiet and contemplative. The pace slows so you can go deeper rather than wider.",
      "Study, rest, and inner work matter more than outer hustle now. Trust the stillness; clarity and wisdom are quietly taking root.",
      "Health-wise, this is a good year for practices that calm the nervous system — meditation, walks, or simply unscheduled time. In career, avoid major public moves; let your expertise mature quietly instead.",
    ],
    opportunities: ["Study and self-development", "Spiritual growth", "Rest and reflection", "Strong months: July, November, April"],
    takeCare: ["Don't isolate too much", "Avoid overthinking", "Be patient with slow results", "Quieter months: September, February"],
  },
  8: {
    theme: "A Year of Achievement",
    essence: "reduces to 8 — a powerful year of ambition, money, and material results.",
    paras: [
      "is a number 8 year for you, ruled by Saturn — serious and rewarding. Effort put in now can translate into real material and career gains.",
      "This is a harvest year for the disciplined. Act with integrity, manage money wisely, and step into the authority you have earned.",
      "Health-wise, ambition can outpace rest this year — guard against burnout even as results accelerate. In relationships, make sure the people who supported your climb don't feel left behind by it.",
    ],
    opportunities: ["Career and financial gains", "Stepping into authority", "Big goals and ambition", "Strong months: August, December, May"],
    takeCare: ["Act with integrity", "Avoid overwork and stress", "Don't be ruthless", "Quieter months: October, March"],
  },
  9: {
    theme: "A Year of Completion",
    essence: "reduces to 9 — a year of endings, release, and clearing space for what's next.",
    paras: [
      "is a number 9 year for you, ruled by Mars — a year of completion. Cycles close now so new ones can begin; let go of what no longer fits.",
      "Finish, forgive, and release this year. Generosity and service bring grace. What you clear now makes room for the fresh 1 year ahead.",
      "Health-wise, releasing old stress is as important as releasing old commitments — this is a good year for letting go of grudges as much as projects. In career, resist starting major new ventures until the new cycle begins next year.",
    ],
    opportunities: ["Completing long projects", "Letting go and healing", "Service and generosity", "Strong months: September, January, June"],
    takeCare: ["Don't cling to the past", "Manage frustration and anger", "Avoid starting brand-new things", "Quieter months: November, April"],
  },
};

export const LUCKY: Record<Digit, Lucky> = {
  1: { days: "Sunday & Monday", colors: [{ name: "Gold", hex: "#E6C766" }, { name: "Orange", hex: "#E08A3C" }, { name: "Yellow", hex: "#EBD55A" }], numbers: "1, 3 & 9", gemstone: "Ruby · Manik", metal: "Gold & Copper", direction: "East" },
  2: { days: "Monday & Friday", colors: [{ name: "White", hex: "#F0F0F5" }, { name: "Cream", hex: "#EDE6D0" }, { name: "Silver", hex: "#C8CCD4" }], numbers: "2, 7 & 9", gemstone: "Pearl · Moti", metal: "Silver", direction: "North-West" },
  3: { days: "Thursday", colors: [{ name: "Yellow", hex: "#EBD55A" }, { name: "Gold", hex: "#E6C766" }, { name: "Saffron", hex: "#E89A3C" }], numbers: "3, 6 & 9", gemstone: "Yellow Sapphire · Pukhraj", metal: "Gold", direction: "North-East" },
  4: { days: "Saturday & Sunday", colors: [{ name: "Grey", hex: "#9AA0A8" }, { name: "Blue", hex: "#5B7FA6" }, { name: "Khaki", hex: "#B7A77E" }], numbers: "4, 8 & 1", gemstone: "Hessonite · Gomed", metal: "Mixed alloys", direction: "South-West" },
  5: { days: "Wednesday", colors: [{ name: "Green", hex: "#5BA877" }, { name: "Turquoise", hex: "#4FB3B0" }, { name: "Light Grey", hex: "#C2C6CC" }], numbers: "5 & 6", gemstone: "Emerald · Panna", metal: "Bronze & Brass", direction: "North" },
  6: { days: "Friday", colors: [{ name: "White", hex: "#F0F0F5" }, { name: "Pink", hex: "#E59BB0" }, { name: "Pastel Blue", hex: "#A9C7E0" }], numbers: "6, 5 & 9", gemstone: "Diamond · Heera", metal: "Silver & Platinum", direction: "South-East" },
  7: { days: "Monday & Sunday", colors: [{ name: "Smoky Grey", hex: "#8A8A94" }, { name: "Sea Green", hex: "#5FA28C" }, { name: "White", hex: "#F0F0F5" }], numbers: "7 & 2", gemstone: "Cat's Eye · Lehsunia", metal: "Mixed alloys", direction: "North-East" },
  8: { days: "Saturday", colors: [{ name: "Black", hex: "#3A3A42" }, { name: "Dark Blue", hex: "#33456B" }, { name: "Deep Grey", hex: "#6E6E78" }], numbers: "8 & 4", gemstone: "Blue Sapphire · Neelam", metal: "Iron & Steel", direction: "West" },
  9: { days: "Tuesday", colors: [{ name: "Red", hex: "#D9534F" }, { name: "Coral", hex: "#E0775C" }, { name: "Crimson", hex: "#B23A48" }], numbers: "9, 3 & 6", gemstone: "Red Coral · Moonga", metal: "Copper", direction: "South" },
};

export const REMEDIES: Record<Digit, Remedies> = {
  1: {
    mantra: "Om Suryaya Namah",
    mantraSub: "Chant 11 or 108 times at sunrise to honour the Sun",
    items: [
      { title: "Offer water to the Sun", desc: "Each morning at sunrise, offer water (Arghya) from a copper vessel facing east — the simplest, most powerful remedy for the Sun." },
      { title: "Wear a Ruby (Manik)", desc: "Set in gold, worn on the ring finger on a Sunday, after consulting a trusted astrologer for your chart." },
      { title: "Donate on Sundays", desc: "Give wheat, jaggery, or copper to those in need. Charity under the Sun's day multiplies its blessings." },
      { title: "Honour your father & elders", desc: "The Sun rules the father. Respect toward elders directly strengthens the Sun's light in your life." },
      { title: "Rise with the dawn", desc: "Wake before sunrise and take a few minutes of daily sunlight to restore vitality and clarity." },
    ],
  },
  2: {
    mantra: "Om Chandraya Namah",
    mantraSub: "Chant on Mondays to strengthen the Moon",
    items: [
      { title: "Honour the Moon", desc: "Offer milk or water to the Moon on Monday nights, and keep a calm evening routine." },
      { title: "Wear a Pearl (Moti)", desc: "Set in silver, worn on the little finger on a Monday, after astrological guidance." },
      { title: "Donate white items", desc: "Give rice, milk, or white cloth on Mondays to bring emotional balance and peace." },
      { title: "Respect your mother", desc: "The Moon rules the mother. Caring for her and elder women strengthens the Moon within." },
      { title: "Keep water near you", desc: "Spend time near water and stay hydrated — the Moon's element soothes and steadies you." },
    ],
  },
  3: {
    mantra: "Om Brihaspataye Namah",
    mantraSub: "Chant on Thursdays to strengthen Jupiter",
    items: [
      { title: "Honour Jupiter", desc: "Worship and chant on Thursdays; offer yellow flowers and respect to teachers and gurus." },
      { title: "Wear Yellow Sapphire (Pukhraj)", desc: "Set in gold, worn on the index finger on a Thursday, after astrological advice." },
      { title: "Donate yellow items", desc: "Give turmeric, gram dal, or bananas on Thursdays to invite wisdom and growth." },
      { title: "Respect teachers & elders", desc: "Jupiter is the guru. Honouring mentors and seeking knowledge strengthens its grace." },
      { title: "Feed and give", desc: "Acts of generosity and feeding others expand Jupiter's blessings in your life." },
    ],
  },
  4: {
    mantra: "Om Rahave Namah",
    mantraSub: "Chant to calm and balance Rahu",
    items: [
      { title: "Pacify Rahu", desc: "Chant the Rahu mantra and keep your environment clean and orderly to settle its restless energy." },
      { title: "Wear Hessonite (Gomed)", desc: "Set appropriately and worn after careful astrological consultation — Rahu's gem is potent." },
      { title: "Donate on Saturdays", desc: "Give mustard oil, blankets, or black sesame to the needy to soften Rahu's effects." },
      { title: "Serve the underserved", desc: "Helping outsiders and the marginalised aligns you with Rahu's better side." },
      { title: "Keep your word", desc: "Honesty and clarity counter Rahu's tendency toward confusion and illusion." },
    ],
  },
  5: {
    mantra: "Om Budhaya Namah",
    mantraSub: "Chant on Wednesdays to strengthen Mercury",
    items: [
      { title: "Honour Mercury", desc: "Chant on Wednesdays and engage your mind — reading, learning, and clear communication please Budh." },
      { title: "Wear an Emerald (Panna)", desc: "Set in gold, worn on the little finger on a Wednesday, after astrological guidance." },
      { title: "Donate green items", desc: "Give green moong dal, green cloth, or plants on Wednesdays for mental clarity." },
      { title: "Care for animals", desc: "Feeding birds and green fodder to cows is a classic remedy to strengthen Mercury." },
      { title: "Use words well", desc: "Honest, kind speech and finishing what you start keep Mercury's energy clean." },
    ],
  },
  6: {
    mantra: "Om Shukraya Namah",
    mantraSub: "Chant on Fridays to strengthen Venus",
    items: [
      { title: "Honour Venus", desc: "Chant on Fridays; surround yourself with beauty, art, and harmony to please Shukra." },
      { title: "Wear a Diamond (Heera)", desc: "Or white sapphire as advised — set in silver or platinum, worn on a Friday after guidance." },
      { title: "Donate white & sweet items", desc: "Give white cloth, sugar, curd, or perfume on Fridays to invite love and comfort." },
      { title: "Respect women", desc: "Venus blesses those who honour women, relationships, and beauty in their lives." },
      { title: "Keep harmony", desc: "Resolve conflicts gently and keep your surroundings clean and beautiful." },
    ],
  },
  7: {
    mantra: "Om Ketave Namah",
    mantraSub: "Chant to balance and strengthen Ketu",
    items: [
      { title: "Pacify Ketu", desc: "Chant the Ketu mantra and keep a regular spiritual or meditative practice." },
      { title: "Wear Cat's Eye (Lehsunia)", desc: "Worn only after careful astrological consultation — Ketu's gem is subtle and strong." },
      { title: "Donate on Tuesdays", desc: "Give blankets, sesame, or food to ascetics and the needy to soften Ketu." },
      { title: "Practise detachment", desc: "Meditation, prayer, and simplicity align you with Ketu's spiritual gifts." },
      { title: "Keep a dog", desc: "Caring for dogs is a traditional remedy associated with calming Ketu." },
    ],
  },
  8: {
    mantra: "Om Shanaischaraya Namah",
    mantraSub: "Chant on Saturdays to strengthen Saturn",
    items: [
      { title: "Honour Saturn", desc: "Chant on Saturdays; act with discipline, honesty, and patience to earn Shani's favour." },
      { title: "Wear Blue Sapphire (Neelam)", desc: "Highly powerful — wear only after careful astrological testing and consultation." },
      { title: "Donate black items", desc: "Give black sesame, mustard oil, iron, or blankets on Saturdays to the poor." },
      { title: "Serve workers & the poor", desc: "Saturn rules labour and the underprivileged; serving them strengthens its grace." },
      { title: "Be disciplined & fair", desc: "Honest work, punctuality, and fairness are the truest remedies for Saturn." },
    ],
  },
  9: {
    mantra: "Om Mangalaya Namah",
    mantraSub: "Chant on Tuesdays to strengthen Mars",
    items: [
      { title: "Honour Mars", desc: "Chant on Tuesdays; channel energy through exercise and disciplined action to please Mangal." },
      { title: "Wear Red Coral (Moonga)", desc: "Set in gold or copper, worn on the ring finger on a Tuesday, after astrological advice." },
      { title: "Donate red items", desc: "Give red lentils (masoor), red cloth, or jaggery on Tuesdays to calm Mars." },
      { title: "Serve with courage", desc: "Protecting others and acts of bravery in a good cause align you with Mars's strength." },
      { title: "Manage your temper", desc: "Physical activity and patience keep Mars's fire productive rather than destructive." },
    ],
  },
};
