/**
 * Mystic Digits — Bhagyank (destiny-number) content.
 *
 * SEO-facing copy for destiny numbers 1–9, consumed by the Bhagyank landing
 * pages (/bhagyank/[number]). Where the Mulank pages describe personality
 * (who you are), these describe the life path (where your life tends to
 * flow) — kept deliberately distinct so the two page sets never read as
 * duplicates. Plain data, safe for client and server components. The
 * planet ↔ number mapping mirrors src/lib/numerology.ts (PLANET_BY_NUMBER).
 */

export type BhagyankNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface BhagyankInfo {
  number: BhagyankNumber;
  planet: string;
  /** One-line essence of this destiny. */
  meaning: string;
  /** Opening life-path paragraph for the landing page. */
  destiny: string;
  /** The core lesson this destiny keeps teaching. */
  lifeLesson: string;
  opportunities: string[];
  challenges: string[];
  careers: string[];
  /** Numbers this Bhagyank generally harmonises with. */
  compatible: BhagyankNumber[];
  /** One practical, authentic Vedic remedy. */
  remedy: string;
}

export const BHAGYANK_CONTENT: Record<BhagyankNumber, BhagyankInfo> = {
  1: {
    number: 1,
    planet: "Sun",
    meaning: "A destiny of leadership, recognition and self-made success",
    destiny:
      "With the Sun guiding your destiny, life keeps placing you in positions where you must step forward and lead. Even if you start quietly, circumstances push you toward independence — projects land in your lap, teams look to you for direction, and the safety of following others never quite satisfies. Your path rewards initiative: the more original and self-reliant your work, the faster doors open. Recognition, authority, and a name of your own are written into this number, but they arrive through courage, not comfort.",
    lifeLesson:
      "To lead without dominating — real authority comes from lifting others, not overshadowing them.",
    opportunities: [
      "Rising into leadership earlier than peers",
      "Building something under your own name",
      "Support from father figures, mentors and the government",
      "Fame or public recognition in your field",
    ],
    challenges: [
      "Ego clashes with authority figures",
      "Loneliness at the top if relationships are neglected",
      "Impatience when progress feels slow",
      "Difficulty delegating and trusting others",
    ],
    careers: [
      "Founder, director or department head",
      "Government and administrative services",
      "Politics and public life",
      "Any field where your name is the brand",
    ],
    compatible: [1, 2, 3, 9],
    remedy:
      "Rise before sunrise and offer water to the Sun; on Sundays, donate wheat or jaggery. Strengthening the Sun steadies the authority your destiny keeps handing you.",
  },
  2: {
    number: 2,
    planet: "Moon",
    meaning: "A destiny of partnership, intuition and emotional influence",
    destiny:
      "With the Moon guiding your destiny, your life unfolds through people and partnerships rather than solo conquest. Opportunities arrive through relationships — a friend's introduction, a partner's faith in you, a collaboration that blossoms. You are meant to work with and through others, and your gift for sensing what people feel becomes your greatest professional asset. Your path has tides: phases of rapid growth followed by quiet consolidation. Learning to move with these rhythms, instead of fighting them, is where your destiny turns kind.",
    lifeLesson:
      "To trust your intuition and hold your emotional centre — your sensitivity is a compass, not a weakness.",
    opportunities: [
      "Success through partnerships and collaborations",
      "Strong support from women and mother figures",
      "Careers touching hearts — counselling, care, creativity",
      "Prosperity connected to water, food, or the public",
    ],
    challenges: [
      "Fortunes that ebb and flow like tides",
      "Decisions delayed by self-doubt",
      "Absorbing other people's stress",
      "Over-dependence on a partner's approval",
    ],
    careers: [
      "Psychology, counselling and healing",
      "Hospitality, food and beverages",
      "Creative arts, music and design",
      "Public-facing and service roles",
    ],
    compatible: [1, 2, 3, 5],
    remedy:
      "On Mondays, offer milk or white rice to those in need and keep water in a silver vessel by your bed; a calm Moon smooths the tides of this destiny.",
  },
  3: {
    number: 3,
    planet: "Jupiter",
    meaning: "A destiny of wisdom, teaching and expanding influence",
    destiny:
      "With Jupiter guiding your destiny, your life expands through knowledge shared. Whatever you learn, life soon asks you to teach — colleagues seek your advice, younger people gravitate to you for guidance, and your words carry unusual weight. Wealth on this path follows wisdom: qualifications, publications, and reputation compound over the years into standing and prosperity. Your destiny is generous but principled; shortcuts and compromises stall it, while honest counsel and generous mentorship accelerate it remarkably.",
    lifeLesson:
      "To share knowledge freely without preaching — wisdom lands only when it is invited.",
    opportunities: [
      "Respect and seniority that grow with age",
      "Success in teaching, advisory and knowledge fields",
      "Blessings through gurus, elders and institutions",
      "Financial growth through reputation and trust",
    ],
    challenges: [
      "Spreading energy across too many pursuits",
      "Being taken for granted by those you help",
      "Frustration when others ignore good advice",
      "Periods of feeling unrecognised early in life",
    ],
    careers: [
      "Education, academia and training",
      "Law, consulting and advisory services",
      "Writing, publishing and media",
      "Banking, finance and religious institutions",
    ],
    compatible: [1, 2, 3, 6, 9],
    remedy:
      "Serve your teachers and elders, and on Thursdays donate yellow items — turmeric, chana dal, or books. Jupiter repays respect for wisdom with an expanding destiny.",
  },
  4: {
    number: 4,
    planet: "Rahu",
    meaning: "A destiny of unconventional success built against the odds",
    destiny:
      "With Rahu guiding your destiny, your life rarely follows the standard script — and it isn't meant to. Conventional routes feel blocked while unusual ones open: sudden opportunities, foreign connections, technology, or fields that didn't exist a generation ago. Progress may look slow and effortful in your twenties, but this number builds like compound interest; the discipline and systems you create quietly become an unshakeable foundation. Many Bhagyank 4 natives surprise everyone — including themselves — with how far persistence eventually carries them.",
    lifeLesson:
      "To keep faith during the slow years — your foundations are being tested, not rejected.",
    opportunities: [
      "Breakthroughs in technology and modern fields",
      "Gains from foreign lands and unconventional paths",
      "Mastery through systems, method and repetition",
      "Sudden turnarounds after long plateaus",
    ],
    challenges: [
      "Success arriving later than for peers",
      "Sudden disruptions that reroute your plans",
      "Feeling like an outsider in traditional settings",
      "Anxiety and overthinking during uncertainty",
    ],
    careers: [
      "Technology, engineering and innovation",
      "Research and specialised technical fields",
      "Import–export and foreign collaborations",
      "Infrastructure, real estate and operations",
    ],
    compatible: [1, 5, 6, 7],
    remedy:
      "Feed birds and stray dogs regularly, and donate blankets or dark-blue items on Saturdays; grounding Rahu turns his sudden turns into sudden gifts.",
  },
  5: {
    number: 5,
    planet: "Mercury",
    meaning: "A destiny of movement, commerce and lifelong reinvention",
    destiny:
      "With Mercury guiding your destiny, your life path is built on movement — of ideas, money, and yourself. Few people with this number stay in one role, one city, or one identity for long; your fortunes multiply each time you adapt. Business and communication are your natural currents: buying, selling, negotiating, writing, connecting people who need each other. Luck on this path favours the quick and curious. When life feels stagnant, that is your signal — this destiny rewards those who keep learning and keep moving.",
    lifeLesson:
      "To pair freedom with follow-through — momentum only becomes fortune when something is finished.",
    opportunities: [
      "Natural luck in business, trade and negotiation",
      "Multiple income streams across a lifetime",
      "Growth through travel and relocation",
      "Youthful energy and adaptability into old age",
    ],
    challenges: [
      "Scattered efforts diluting big wins",
      "Restlessness sabotaging stable gains",
      "Overcommitting to too many ventures",
      "Money flowing out as easily as it flows in",
    ],
    careers: [
      "Business, trading and e-commerce",
      "Marketing, sales and communication",
      "Writing, media and public speaking",
      "Travel, logistics and networking-driven fields",
    ],
    compatible: [1, 3, 5, 6, 9],
    remedy:
      "On Wednesdays, donate green moong dal and feed green fodder to cows; a steady Mercury turns your restless luck into lasting wealth.",
  },
  6: {
    number: 6,
    planet: "Venus",
    meaning: "A destiny of love, luxury and gracious responsibility",
    destiny:
      "With Venus guiding your destiny, life draws you toward beauty, comfort, and the care of others. Doors open through charm and relationships; people simply enjoy working with you, and that goodwill becomes your fortune. Home, family, and aesthetics are not side notes on this path — they are the path: many Bhagyank 6 natives prosper in fields of beauty, hospitality, and luxury, or find their fortunes rise after marriage. Your destiny asks you to carry responsibility for loved ones gracefully; carried well, it returns comfort and abundance in full measure.",
    lifeLesson:
      "To give care without losing yourself — love that erases you serves no one.",
    opportunities: [
      "Prosperity linked to marriage and family",
      "Success in beauty, luxury and comfort industries",
      "Natural charm that wins allies and clients",
      "A home life that becomes a source of strength",
    ],
    challenges: [
      "Family responsibilities arriving early or heavily",
      "Indulgence draining wealth and health",
      "Difficulty saying no to loved ones",
      "Attachment turning into possessiveness",
    ],
    careers: [
      "Fashion, beauty and lifestyle brands",
      "Hospitality, food and interior design",
      "Arts, entertainment and event management",
      "Medicine, caregiving and social service",
    ],
    compatible: [3, 5, 6, 9],
    remedy:
      "Keep your home clean and fragrant, respect your partner, and on Fridays offer white sweets or flowers; Venus rewards a gracious household with a gracious destiny.",
  },
  7: {
    number: 7,
    planet: "Ketu",
    meaning: "A destiny of inner mastery, research and spiritual depth",
    destiny:
      "With Ketu guiding your destiny, your life path runs inward before it runs upward. Material success alone never satisfies this number; your milestones are insights, mastery, and meaning. Life repeatedly detaches you from what you cling to — jobs, places, even beliefs — not as punishment but as redirection toward your real work: deep study, research, healing, or spiritual understanding. Many Bhagyank 7 natives become the quiet expert others consult, respected for knowledge that took years of solitary devotion to build. Trust the detours; on this path, they are the way.",
    lifeLesson:
      "To let go gracefully — everything Ketu removes was blocking something deeper.",
    opportunities: [
      "Mastery in a specialised or esoteric field",
      "Respect as a researcher, analyst or guide",
      "Spiritual growth that steadies every other area",
      "Flashes of intuition that outrun logic",
    ],
    challenges: [
      "Detachment straining close relationships",
      "Material progress feeling hollow at times",
      "Isolation when solitude turns to withdrawal",
      "Restless searching before the path becomes clear",
    ],
    careers: [
      "Research, analysis and data science",
      "Spirituality, healing and psychology",
      "Occult sciences, astrology and philosophy",
      "Writing and independent scholarship",
    ],
    compatible: [1, 2, 4, 7],
    remedy:
      "Meditate daily, even briefly, and feed dogs or donate blankets to the needy; honouring Ketu turns detachment into clarity instead of loss.",
  },
  8: {
    number: 8,
    planet: "Saturn",
    meaning: "A destiny of late-blooming power earned through patience",
    destiny:
      "With Saturn guiding your destiny, your life is a long climb with a magnificent summit. This is the number of delayed but enormous rewards: while others sprint ahead in their twenties, your path tests you with obstacles, extra workloads, and lessons in patience. Every test is an installment toward authority — Saturn repays each honest effort with interest, usually after 35. Bhagyank 8 natives who stay disciplined often end up wealthier and more powerful than anyone who overtook them early. Justice, structure, and endurance are your tools; time is your greatest ally.",
    lifeLesson:
      "To keep integrity when no one is watching — Saturn audits everything and pays accordingly.",
    opportunities: [
      "Substantial wealth and authority in maturity",
      "Executive power in large organisations",
      "Strength forged by early hardships",
      "Deep respect earned through fairness",
    ],
    challenges: [
      "Slow starts and delayed recognition",
      "Heavier karmic tests than other numbers",
      "Work consuming personal life",
      "Pessimism during Saturn's long lessons",
    ],
    careers: [
      "Corporate leadership and management",
      "Law, judiciary and government",
      "Real estate, mining and heavy industry",
      "Finance, insurance and long-horizon ventures",
    ],
    compatible: [3, 5, 6],
    remedy:
      "On Saturdays, light a sesame-oil lamp under a peepal tree and serve workers and the underprivileged; Saturn softens for those who honour honest labour.",
  },
  9: {
    number: 9,
    planet: "Mars",
    meaning: "A destiny of courage, completion and humanitarian purpose",
    destiny:
      "With Mars guiding your destiny, your life is built for causes larger than yourself. Nine is the number of completion — old karmic accounts closing — so your path is intense from the start: early responsibilities, battles worth fighting, and a heart that cannot look away from injustice. Energy is your inheritance; when it serves a purpose, you are unstoppable, and helping others uplifts your own fortunes with uncanny reliability. Many Bhagyank 9 natives find that the more selflessly they give, the more life hands back — influence, loyalty, and a legacy that outlives them.",
    lifeLesson:
      "To master the fire — anger spent in outbursts is courage stolen from your mission.",
    opportunities: [
      "Leadership in causes, crises and service",
      "Gains multiplying through generosity",
      "Courage that opens doors others fear",
      "A lasting legacy and public goodwill",
    ],
    challenges: [
      "Conflicts and confrontations along the way",
      "Early life demanding sacrifice",
      "Burnout from carrying others' battles",
      "Impulsive decisions in heated moments",
    ],
    careers: [
      "Defence, police and emergency services",
      "Surgery, sports and physical disciplines",
      "NGOs, activism and public service",
      "Engineering, fire and energy sectors",
    ],
    compatible: [1, 2, 3, 6, 9],
    remedy:
      "On Tuesdays, donate red masoor dal and visit a Hanuman temple; channel Mars through exercise and service, and his fire becomes your engine.",
  },
};

export const BHAGYANK_NUMBERS: BhagyankNumber[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
