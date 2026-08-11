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

export interface BhagyankFaq {
  q: string;
  a: string;
}

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
  /**
   * Four query-shaped FAQs per number, rendered on the page and mirrored into
   * FAQPage JSON-LD. Deliberately different angles from the Mulank FAQs
   * (calculation, fortune, marriage compatibility, Mulank-vs-Bhagyank) so the
   * two page sets never compete for the same query.
   */
  faqs: BhagyankFaq[];
}

/**
 * Worked calculation example per destiny number, matching the reduction order
 * used in src/lib/numerology.ts (day, month and year each reduced first, then
 * summed and reduced). Every example below is verified against that function.
 */
const CALC_EXAMPLES: Record<BhagyankNumber, string> = {
  1: "someone born on 08/01/1990 has day 8, month 1, and year 1990 → 1 + 9 + 9 + 0 = 19 → 1. Adding 8 + 1 + 1 gives 10, which reduces to 1",
  2: "someone born on 18/01/1990 has day 18 → 9, month 1, and year 1990 → 1. Adding 9 + 1 + 1 gives 11, which reduces to 2",
  3: "someone born on 01/01/1990 has day 1, month 1, and year 1990 → 1. Adding 1 + 1 + 1 gives 3",
  4: "someone born on 20/01/1990 has day 20 → 2, month 1, and year 1990 → 1. Adding 2 + 1 + 1 gives 4",
  5: "someone born on 12/01/1990 has day 12 → 3, month 1, and year 1990 → 1. Adding 3 + 1 + 1 gives 5",
  6: "someone born on 12/02/1990 has day 12 → 3, month 2, and year 1990 → 1. Adding 3 + 2 + 1 gives 6",
  7: "someone born on 05/01/1990 has day 5, month 1, and year 1990 → 1. Adding 5 + 1 + 1 gives 7",
  8: "someone born on 15/01/1990 has day 15 → 6, month 1, and year 1990 → 1. Adding 6 + 1 + 1 gives 8",
  9: "someone born on 25/01/1990 has day 25 → 7, month 1, and year 1990 → 1. Adding 7 + 1 + 1 gives 9",
};

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
    faqs: [
      {
        q: "How is Bhagyank 1 calculated?",
        a: `Bhagyank comes from your complete date of birth, not just the day. Reduce the day, the month and the year each to a single digit, add those three results together, and reduce once more. For example, ${CALC_EXAMPLES[1]}. Anyone whose full date of birth reduces to 1 this way has Bhagyank 1, whatever day of the month they were born on.`,
      },
      {
        q: "Is Bhagyank 1 a lucky destiny number?",
        a: "Bhagyank 1 is among the strongest destiny numbers for recognition and self-made success, because the Sun rules it. Its luck is conditional rather than automatic: it activates when you take initiative and work under your own direction, and it stays quiet in roles where you hold no authority and receive no visible credit. Many Bhagyank 1 natives describe years of frustration in subordinate jobs followed by rapid progress the moment they start something of their own.",
      },
      {
        q: "Which numbers are compatible with Bhagyank 1 in marriage?",
        a: "Bhagyank 1 harmonises most easily with 1, 2, 3 and 9. A partner with 2 brings the emotional patience that softens 1's drive, 3 adds warmth and perspective, and 9 matches its intensity without competing for control. Two 1s can work well, but only when each partner has a separate arena of authority. Compatibility in numerology is a tendency, not a verdict — a full reading weighs Mulank, Bhagyank and name number together.",
      },
      {
        q: "What is the difference between Mulank 1 and Bhagyank 1?",
        a: "Both are ruled by the Sun, but they describe different things. Mulank 1 comes from your birth day alone and describes your personality — direct, independent, quick to take charge. Bhagyank 1 comes from your entire date of birth and describes where life keeps steering you: toward leadership and a name of your own, whether or not your temperament asked for it. When both are 1, character and destiny reinforce each other strongly. When only the Bhagyank is 1, life pushes you into authority that may feel uncomfortable for years before it feels right.",
      },
    ],
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
    faqs: [
      {
        q: "How is Bhagyank 2 calculated?",
        a: `Bhagyank comes from your complete date of birth, not just the day. Reduce the day, the month and the year each to a single digit, add those three results together, and reduce once more. For example, ${CALC_EXAMPLES[2]}. Anyone whose full date of birth reduces to 2 this way has Bhagyank 2.`,
      },
      {
        q: "Is Bhagyank 2 a lucky destiny number?",
        a: "Bhagyank 2 is fortunate in a quieter way than the more forceful numbers. Its luck arrives through people — an introduction, a partner's backing, a client who becomes a friend — rather than through solo effort, so it can look like coincidence to outsiders. The Moon also gives this destiny a tidal rhythm: strong phases followed by flat ones. Natives who plan for the low tides instead of panicking in them tend to do very well over a lifetime.",
      },
      {
        q: "Which numbers are compatible with Bhagyank 2 in marriage?",
        a: "Bhagyank 2 harmonises most easily with 1, 2, 3 and 5. Number 1 supplies the decisiveness that 2 can lack, 3 offers reassurance and perspective, and 5 keeps life varied enough to prevent emotional stagnation. Two 2s share deep understanding but may struggle when a firm decision is needed. Numerology describes tendencies rather than rules — Mulank, Bhagyank and name number are read together before drawing conclusions.",
      },
      {
        q: "What is the difference between Mulank 2 and Bhagyank 2?",
        a: "Both answer to the Moon, but at different levels. Mulank 2, taken from your birth day, describes a sensitive, diplomatic, intuitive temperament. Bhagyank 2, taken from your whole date of birth, describes a life that advances through partnership — marriage, business partners, collaborators — regardless of how independent you feel. Someone can be personally quite forceful and still have a Bhagyank 2 destiny that refuses to reward going it alone.",
      },
    ],
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
    faqs: [
      {
        q: "How is Bhagyank 3 calculated?",
        a: `Bhagyank comes from your complete date of birth, not just the day. Reduce the day, the month and the year each to a single digit, add those three results together, and reduce once more. For example, ${CALC_EXAMPLES[3]}. Anyone whose full date of birth reduces to 3 this way has Bhagyank 3.`,
      },
      {
        q: "Is Bhagyank 3 a lucky destiny number?",
        a: "Bhagyank 3 is widely regarded as one of the most fortunate destiny numbers, because Jupiter governs growth, knowledge and good counsel. The catch is timing: this number often under-delivers in youth and then compounds steadily, so respect and prosperity tend to arrive in the thirties and keep rising. Its luck responds to integrity — qualifications, honest advice and generosity accelerate it, while shortcuts stall it noticeably.",
      },
      {
        q: "Which numbers are compatible with Bhagyank 3 in marriage?",
        a: "Bhagyank 3 harmonises most easily with 1, 2, 3, 6 and 9. Number 6 brings warmth and a settled home, 1 brings drive that turns 3's ideas into action, and 9 shares its sense of purpose. Two 3s enjoy a lively, conversational marriage but should watch a shared tendency to overextend. As always, compatibility is one factor among several rather than a final answer.",
      },
      {
        q: "What is the difference between Mulank 3 and Bhagyank 3?",
        a: "Both are Jupiter's, but Mulank 3 is character and Bhagyank 3 is trajectory. Mulank 3 from your birth day gives an expressive, optimistic, opinionated personality. Bhagyank 3 from your full date of birth gives a life that keeps turning you into a teacher, adviser or authority on something, often long before you feel qualified. People with Bhagyank 3 frequently find themselves consulted for guidance by colleagues and family without ever having sought the role.",
      },
    ],
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
    faqs: [
      {
        q: "How is Bhagyank 4 calculated?",
        a: `Bhagyank comes from your complete date of birth, not just the day. Reduce the day, the month and the year each to a single digit, add those three results together, and reduce once more. For example, ${CALC_EXAMPLES[4]}. Anyone whose full date of birth reduces to 4 this way has Bhagyank 4.`,
      },
      {
        q: "Is Bhagyank 4 an unlucky destiny number?",
        a: "No — Bhagyank 4 has a difficult reputation it only half deserves. Rahu makes the path unconventional rather than unfortunate: standard routes feel blocked while unusual ones open, and results often arrive later than for peers. What looks like bad luck in the twenties is usually a foundation being built slowly. Natives who stay methodical through the flat years frequently overtake everyone who started faster, particularly in technology, research and anything involving foreign connections.",
      },
      {
        q: "Which numbers are compatible with Bhagyank 4 in marriage?",
        a: "Bhagyank 4 harmonises most easily with 1, 5, 6 and 7. Number 6 brings the domestic warmth and stability that steadies Rahu's turbulence, 1 provides clear direction, and 7 shares its comfort with depth and solitude. A partner who needs constant predictability may find this destiny's sudden reroutes hard to live with. Compatibility here is a tendency, not a rule.",
      },
      {
        q: "What is the difference between Mulank 4 and Bhagyank 4?",
        a: "Mulank 4 from your birth day describes an unconventional, methodical, sometimes contrarian personality. Bhagyank 4 from your full date of birth describes a life path that refuses the standard script — late recognition, sudden turns, and success through routes nobody planned for you. A person can be entirely conventional in temperament and still carry a Bhagyank 4 destiny that keeps rerouting them, which is often the harder version to live with.",
      },
    ],
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
    faqs: [
      {
        q: "How is Bhagyank 5 calculated?",
        a: `Bhagyank comes from your complete date of birth, not just the day. Reduce the day, the month and the year each to a single digit, add those three results together, and reduce once more. For example, ${CALC_EXAMPLES[5]}. Anyone whose full date of birth reduces to 5 this way has Bhagyank 5.`,
      },
      {
        q: "Is Bhagyank 5 good for business?",
        a: "Bhagyank 5 is generally considered the most naturally commercial destiny number, because Mercury governs trade, negotiation and communication. Opportunities to buy, sell, broker and connect keep appearing, and multiple income streams across a lifetime are common. The weakness is finishing rather than starting: money moves out as easily as it moves in, and several half-built ventures will always outperform none but underperform one completed properly.",
      },
      {
        q: "Which numbers are compatible with Bhagyank 5 in marriage?",
        a: "Bhagyank 5 harmonises most easily with 1, 3, 5, 6 and 9. Number 6 anchors it with a home worth returning to, 3 matches its quickness of mind, and 1 gives direction to its scattered energy. Two 5s make an exciting but financially volatile pair. Treat this as a starting point — the full picture needs Mulank and name number alongside Bhagyank.",
      },
      {
        q: "What is the difference between Mulank 5 and Bhagyank 5?",
        a: "Mulank 5 from your birth day gives a quick, curious, restless personality that dislikes routine. Bhagyank 5 from your full date of birth gives a life that keeps demanding movement — job changes, relocations, reinventions — even from people who would happily have stayed put. A steady, cautious person with Bhagyank 5 often feels life is unusually turbulent, when in fact the destiny is simply asking them to adapt.",
      },
    ],
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
    faqs: [
      {
        q: "How is Bhagyank 6 calculated?",
        a: `Bhagyank comes from your complete date of birth, not just the day. Reduce the day, the month and the year each to a single digit, add those three results together, and reduce once more. For example, ${CALC_EXAMPLES[6]}. Anyone whose full date of birth reduces to 6 this way has Bhagyank 6.`,
      },
      {
        q: "Is Bhagyank 6 a lucky destiny number?",
        a: "Bhagyank 6 is one of the most comfortable destiny numbers, because Venus governs beauty, affection and material ease. Fortune tends to arrive through relationships and often improves noticeably after marriage. The cost is responsibility: family obligations usually land early and heavily on this number, and wealth can drain through indulgence as fast as charm brings it in. Managed sensibly, few destinies live as well as this one.",
      },
      {
        q: "Which numbers are compatible with Bhagyank 6 in marriage?",
        a: "Bhagyank 6 harmonises most easily with 3, 5, 6 and 9. Number 3 shares its sociability and adds perspective, 5 keeps things interesting, and 9 matches its capacity for devotion. Two 6s can build a genuinely beautiful home together, provided neither slips into possessiveness. Numerology indicates tendencies — read Mulank, Bhagyank and name number together before drawing firm conclusions.",
      },
      {
        q: "What is the difference between Mulank 6 and Bhagyank 6?",
        a: "Mulank 6 from your birth day gives a charming, aesthetic, affectionate personality drawn to comfort and harmony. Bhagyank 6 from your full date of birth gives a life organised around care and responsibility for others — family, dependents, a household that relies on you — whether or not you are naturally nurturing. Where Mulank 6 enjoys beauty, Bhagyank 6 is repeatedly handed the duty of maintaining it.",
      },
    ],
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
    faqs: [
      {
        q: "How is Bhagyank 7 calculated?",
        a: `Bhagyank comes from your complete date of birth, not just the day. Reduce the day, the month and the year each to a single digit, add those three results together, and reduce once more. For example, ${CALC_EXAMPLES[7]}. Anyone whose full date of birth reduces to 7 this way has Bhagyank 7.`,
      },
      {
        q: "Is Bhagyank 7 a spiritual destiny number?",
        a: "Yes — Bhagyank 7 is the most inward of the destiny numbers, because Ketu governs detachment, research and insight. Purely material goals tend to feel hollow on this path, and life has a habit of removing what you cling to hardest, which reads as misfortune until you notice what it clears space for. Natives typically become the quiet specialist others consult, respected for knowledge built through years of solitary work.",
      },
      {
        q: "Which numbers are compatible with Bhagyank 7 in marriage?",
        a: "Bhagyank 7 harmonises most easily with 1, 2, 4 and 7. Number 2 offers the emotional patience to sit with 7's silences, 4 shares its comfort with unconventional living, and 1 supplies worldly direction it may neglect. A partner who reads solitude as rejection will find this destiny difficult. Compatibility is one input among several, not a verdict.",
      },
      {
        q: "What is the difference between Mulank 7 and Bhagyank 7?",
        a: "Mulank 7 from your birth day gives a reflective, analytical, privately-minded personality. Bhagyank 7 from your full date of birth gives a life that keeps steering you toward depth — research, study, healing or spiritual practice — often through detours that dismantle your earlier plans. An outgoing, sociable person with Bhagyank 7 usually finds that their most meaningful work still ends up being done alone.",
      },
    ],
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
    faqs: [
      {
        q: "How is Bhagyank 8 calculated?",
        a: `Bhagyank comes from your complete date of birth, not just the day. Reduce the day, the month and the year each to a single digit, add those three results together, and reduce once more. For example, ${CALC_EXAMPLES[8]}. Anyone whose full date of birth reduces to 8 this way has Bhagyank 8.`,
      },
      {
        q: "Is Bhagyank 8 an unlucky destiny number?",
        a: "Bhagyank 8 is feared more than it should be. Saturn does make this the slowest destiny number — obstacles, extra workload and delayed recognition are genuinely part of it, and the twenties can be punishing. But Saturn pays for honest effort with interest, usually from the mid-thirties onward. Bhagyank 8 natives who keep their discipline and their integrity often end up holding more wealth and authority than the peers who raced past them early.",
      },
      {
        q: "Which numbers are compatible with Bhagyank 8 in marriage?",
        a: "Bhagyank 8 harmonises most easily with 3, 5 and 6. Number 6 brings warmth and ease into a life that can become all duty, 3 lifts the mood and widens the outlook, and 5 keeps things moving when Saturn's pace turns heavy. Pairing two 8s tends to compound seriousness rather than relieve it. Read this alongside Mulank and name number rather than on its own.",
      },
      {
        q: "What is the difference between Mulank 8 and Bhagyank 8?",
        a: "Mulank 8 from your birth day gives a disciplined, patient, ambitious personality that is comfortable with hard work. Bhagyank 8 from your full date of birth gives a life structured as a long climb — repeated tests, responsibility handed over early, and rewards that arrive late but substantially. Someone light-hearted by nature with Bhagyank 8 often feels life is unfairly heavy; the destiny is demanding endurance their temperament never asked for.",
      },
    ],
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
    faqs: [
      {
        q: "How is Bhagyank 9 calculated?",
        a: `Bhagyank comes from your complete date of birth, not just the day. Reduce the day, the month and the year each to a single digit, add those three results together, and reduce once more. For example, ${CALC_EXAMPLES[9]}. Anyone whose full date of birth reduces to 9 this way has Bhagyank 9.`,
      },
      {
        q: "Is Bhagyank 9 a powerful destiny number?",
        a: "Bhagyank 9 is considered the most intense of the destiny numbers. Nine represents completion, so this path tends to front-load its difficulties — early responsibility, conflict, and situations that demand courage before you feel ready. In exchange it gives unusual stamina and a reliable pattern: generosity returns as influence and loyalty. The recurring risk is burnout from fighting battles that were never yours to carry.",
      },
      {
        q: "Which numbers are compatible with Bhagyank 9 in marriage?",
        a: "Bhagyank 9 harmonises most easily with 1, 2, 3, 6 and 9. Number 6 provides the softness and home comfort that cools Mars, 2 absorbs its intensity with patience, and 3 shares its idealism. Two 9s can be a formidable pair working toward a shared cause, but the household needs a deliberate way to defuse anger. Compatibility indicates tendency, not certainty.",
      },
      {
        q: "What is the difference between Mulank 9 and Bhagyank 9?",
        a: "Mulank 9 from your birth day gives a courageous, protective, quick-tempered personality. Bhagyank 9 from your full date of birth gives a life pulled toward causes larger than yourself — service, crisis work, defending people who cannot defend themselves — regardless of temperament. A mild, conflict-averse person with Bhagyank 9 often finds they keep being placed in fights they would rather have avoided.",
      },
    ],
  },
};

export const BHAGYANK_NUMBERS: BhagyankNumber[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
