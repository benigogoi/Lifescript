/**
 * Mystic Digits — Mulank (birth-number) content.
 *
 * Shared, SEO-facing copy for numbers 1–9, consumed by both the free
 * calculator (/calculator) and the Mulank landing pages (/mulank/[number]).
 * Kept as plain data (no server-only imports) so it can be used from client
 * and server components alike. The planet ↔ number mapping mirrors
 * src/lib/numerology.ts (PLANET_BY_NUMBER).
 */

export type MulankNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface MulankFaq {
  q: string;
  a: string;
}

export interface MulankInfo {
  number: MulankNumber;
  planet: string;
  /** One-line essence, used on the calculator result card. */
  meaning: string;
  luckyColor: string;
  luckyDay: string;
  gemstone: string;
  /** Numbers this Mulank generally harmonises with. */
  compatible: MulankNumber[];
  /** Opening personality paragraph for the landing page. */
  personality: string;
  strengths: string[];
  weaknesses: string[];
  careers: string[];
  /** Longer career & money paragraph, follows the careers list. */
  careerDetail: string;
  /** Love, marriage & relationships paragraph. */
  love: string;
  /** Health & wellbeing paragraph (general lifestyle guidance, not medical advice). */
  health: string;
  /** How this Mulank experiences 2026, a Universal Year 1 (2+0+2+6 = 10 → 1). */
  year2026: string;
  /** One practical, authentic Vedic remedy. */
  remedy: string;
  /** Page FAQs; also rendered as FAQPage JSON-LD. */
  faqs: MulankFaq[];
}

export const MULANK_CONTENT: Record<MulankNumber, MulankInfo> = {
  1: {
    number: 1,
    planet: "Sun",
    meaning: "Natural leader, independent, ambitious",
    luckyColor: "Gold & Royal Orange",
    luckyDay: "Sunday",
    gemstone: "Ruby",
    compatible: [1, 2, 3, 9],
    personality:
      "Ruled by the Sun, people with Mulank 1 are born to lead. You carry a strong sense of self, a clear vision, and the drive to turn ideas into reality. You dislike being told what to do and shine brightest when you are at the helm. Confident, original, and pioneering, you set the pace for others to follow.",
    strengths: [
      "Decisive and self-reliant",
      "Strong willpower and ambition",
      "Original, pioneering thinker",
      "Natural authority and charisma",
    ],
    weaknesses: [
      "Can become domineering or stubborn",
      "Struggles to accept criticism",
      "Ego may overshadow teamwork",
      "Impatient with slower-moving people",
    ],
    careers: [
      "Entrepreneur and founder",
      "Senior management and leadership",
      "Politics and administration",
      "Independent professional or consultant",
    ],
    careerDetail:
      "Money follows visibility for Mulank 1 — you earn best where your name is attached to the result. Salaried roles work only while there is a clear ladder to climb; the moment growth stalls, restlessness sets in, and that restlessness is usually a sign to build something of your own. Avoid business partnerships where authority is split evenly: you thrive as the clear decision-maker with strong executors around you, not as one of two captains.",
    love:
      "In love, Mulank 1 protects fiercely and provides generously, but needs a partner who admires rather than competes. You express affection through action — solving problems, opening doors, building a future — more than through words. The friction point is control: relationships flourish once you let your partner lead in their own domains. Warm, loyal Mulank 2 and passionate Mulank 9 partners tend to balance your fire best, while two strong 1s can work if both keep separate kingdoms.",
    health:
      "The Sun rules the heart, spine, and eyes, so these deserve your attention as the years pass. Mulank 1 natives run on ambition and often ignore rest until the body forces the issue — schedule downtime the way you schedule meetings. Morning sunlight, regular cardiovascular exercise, and keeping anger in check do more for you than any supplement.",
    year2026:
      "2026 is a Universal Year 1 — the Sun's own energy, and therefore your year. Beginnings started now carry unusual momentum: a venture, a role, a relocation, a public step forward. The caution is overreach; with everything green-lit, choose the one or two launches that matter and pour yourself into them rather than starting five things at half strength.",
    remedy:
      "Offer water to the rising Sun (Surya Arghya) each morning and keep a small piece of gold or copper with you to strengthen the Sun's energy.",
    faqs: [
      {
        q: "Which birth dates give Mulank 1?",
        a: "Anyone born on the 1st, 10th, 19th, or 28th of any month has Mulank 1, because the digits of the birth day reduce to 1 (for example 28 → 2 + 8 = 10 → 1).",
      },
      {
        q: "Is Mulank 1 lucky?",
        a: "Mulank 1 is considered one of the most fortunate birth numbers for leadership, recognition, and self-made success, as it is ruled by the Sun. Its luck strengthens when natives act independently and take initiative rather than waiting for opportunities.",
      },
      {
        q: "Who should Mulank 1 marry?",
        a: "Mulank 1 harmonises best with partners whose numbers are 1, 2, 3, or 9. Mulank 2 brings emotional balance to 1's fire, while 9 matches its energy and drive. With another 1, the marriage works when both partners respect each other's independence.",
      },
      {
        q: "Which career is best for Mulank 1?",
        a: "Mulank 1 excels in roles with authority and visibility — entrepreneurship, senior management, politics, government service, and independent professions. They struggle most in rigid subordinate roles with no path to leadership.",
      },
    ],
  },
  2: {
    number: 2,
    planet: "Moon",
    meaning: "Intuitive, sensitive, a natural peacemaker",
    luckyColor: "White & Silver",
    luckyDay: "Monday",
    gemstone: "Pearl",
    compatible: [1, 2, 3, 5],
    personality:
      "Ruled by the Moon, Mulank 2 people are gentle, intuitive, and deeply attuned to the feelings of others. You are a natural peacemaker who values harmony and connection over conflict. Imaginative and emotionally intelligent, you read situations through feeling as much as logic, which makes you a trusted friend and a thoughtful partner.",
    strengths: [
      "Empathetic and diplomatic",
      "Strong intuition and imagination",
      "Cooperative and supportive",
      "Sensitive to beauty and detail",
    ],
    weaknesses: [
      "Over-sensitive to criticism",
      "Prone to mood swings and worry",
      "Can be indecisive",
      "May depend too much on others",
    ],
    careers: [
      "Counselling and psychology",
      "Art, music and design",
      "Healthcare and caregiving",
      "Mediation, HR and diplomacy",
    ],
    careerDetail:
      "Mulank 2 earns through people, not products — your professional value is your ability to sense what others need before they say it. You do your best work in supportive, low-conflict environments and alongside a strong decision-maker who values your counsel; aggressive, cut-throat workplaces drain you faster than long hours ever will. Financially, steady accumulation suits you better than risky bets, and partnership ventures work well when your partner handles confrontation.",
    love:
      "Love is where Mulank 2 truly lives. You are a devoted, affectionate partner who remembers the small things and builds deep emotional intimacy — but you feel neglect keenly, sometimes before any neglect is intended. Your happiness depends on a partner who communicates reassurance openly. The steady strength of Mulank 1, the warmth of 3, or the liveliness of 5 pair beautifully with you; with another 2, the bond is tender but both must guard against mutual moodiness.",
    health:
      "The Moon governs the mind, fluids, and digestion, so your health follows your emotional state more directly than most. Sleep is non-negotiable for Mulank 2 — a rested Moon native is intuitive and calm, an exhausted one anxious and scattered. Favour warm, regular meals, limit late nights, and treat practices like meditation or journaling as maintenance, not luxury.",
    year2026:
      "2026's Universal Year 1 energy pushes everyone toward bold starts — which can feel loud and hurried to a Moon-ruled 2. Your play this year is quiet initiative: begin the thing you have been contemplating, but on your own gentle terms. Partnerships formed in a 1 year tend to define the years that follow, so choose collaborators carefully and let your intuition veto anyone who feels wrong.",
    remedy:
      "Drink water stored in a silver vessel and honour the mother figures in your life; offering milk on Mondays calms and strengthens the Moon.",
    faqs: [
      {
        q: "Which birth dates give Mulank 2?",
        a: "Anyone born on the 2nd, 11th, 20th, or 29th of any month has Mulank 2, because the digits of the birth day reduce to 2 (for example 29 → 2 + 9 = 11 → 2).",
      },
      {
        q: "Is Mulank 2 good or bad?",
        a: "Mulank 2 is a gentle, fortunate number for relationships, creativity, and intuition. Its challenges — moodiness and indecision — soften greatly with a calm routine and a supportive environment, letting the Moon's gifts shine.",
      },
      {
        q: "Who should Mulank 2 marry?",
        a: "Mulank 2 harmonises best with 1, 2, 3, and 5. Mulank 1 provides the steadiness and protection a 2 craves, while 3's optimism lifts their moods. The key need in any match is a partner who values emotional connection.",
      },
      {
        q: "Which career is best for Mulank 2?",
        a: "Mulank 2 thrives in people-centred work: counselling, psychology, healthcare, HR, teaching, art, music, and design. They do best in harmonious workplaces and struggle in aggressive, high-conflict roles.",
      },
    ],
  },
  3: {
    number: 3,
    planet: "Jupiter",
    meaning: "Creative, expressive, optimistic",
    luckyColor: "Yellow & Gold",
    luckyDay: "Thursday",
    gemstone: "Yellow Sapphire",
    compatible: [1, 2, 3, 6, 9],
    personality:
      "Ruled by Jupiter, Mulank 3 people are creative, wise, and naturally optimistic. You express yourself with warmth and confidence, and people are drawn to your knowledge and good humour. With a love of learning and a generous spirit, you grow through teaching, sharing, and guiding others toward their best selves.",
    strengths: [
      "Expressive and articulate",
      "Optimistic and inspiring",
      "Knowledgeable and disciplined",
      "Generous and principled",
    ],
    weaknesses: [
      "Can be overly critical or preachy",
      "Tendency to overcommit",
      "Impatient with incompetence",
      "May scatter energy across too many interests",
    ],
    careers: [
      "Teaching and academia",
      "Writing, media and publishing",
      "Law and advisory roles",
      "Finance and mentorship",
    ],
    careerDetail:
      "Jupiter rewards Mulank 3 with a career that compounds: every qualification, article, talk, and mentee adds to a reputation that eventually earns on its own. Your income grows with your authority in a subject, so pick a field you can happily study for decades. The trap is scattering — five half-built expertises pay far less than one deep one. Positions of counsel (advisor, teacher, consultant) suit you better than pure execution roles.",
    love:
      "Mulank 3 loves with warmth, humour, and a teacher's generosity — you want to grow together, and you make an inspiring, principled partner. You need a mate who enjoys conversation and shares your values; intellectual loneliness inside a relationship is the one thing you cannot tolerate. Take care not to lecture where you mean to love. The devotion of 2, the shared idealism of 9, and the grace of 6 all pair well; two 3s make a lively, learned house.",
    health:
      "Jupiter rules the liver, digestion, and body mass, so moderation at the table is your lifelong health practice — 3s love good food and generous living. An active lifestyle protects you more than restriction does; walking, yoga, and any discipline practised regularly suits Jupiter's love of routine wisdom. Guard your throat and voice, your instruments of expression.",
    year2026:
      "In 2026's Universal Year 1, Jupiter's student becomes the founder. This is the year to finally publish, launch the course, start the practice, or claim the platform you have been preparing for quietly. New beginnings favour the bold in a 1 year — and your wisdom is only visible once it is expressed. Commit to one flagship project and let it carry your name.",
    remedy:
      "Apply a saffron or turmeric tilak on the forehead and show respect to teachers and elders; chanting a Guru mantra on Thursdays strengthens Jupiter.",
    faqs: [
      {
        q: "Which birth dates give Mulank 3?",
        a: "Anyone born on the 3rd, 12th, 21st, or 30th of any month has Mulank 3, because the digits of the birth day reduce to 3 (for example 30 → 3 + 0 = 3).",
      },
      {
        q: "Is Mulank 3 lucky?",
        a: "Yes — Mulank 3 is ruled by Jupiter, the great benefic in Vedic tradition, and is considered auspicious for knowledge, respect, wealth, and family life. Its fortunes grow with education and ethical conduct.",
      },
      {
        q: "Who should Mulank 3 marry?",
        a: "Mulank 3 harmonises best with 1, 2, 3, 6, and 9. Number 9 shares its idealism, 6 brings beauty and devotion, and 2 offers emotional depth. A 3 needs a partner who enjoys conversation and shared growth.",
      },
      {
        q: "Which career is best for Mulank 3?",
        a: "Teaching, writing, law, publishing, finance, and advisory roles suit Mulank 3 best — any field where knowledge and reputation compound over time. They flourish as mentors and advisors rather than pure executors.",
      },
    ],
  },
  4: {
    number: 4,
    planet: "Rahu",
    meaning: "Disciplined, hardworking, builder",
    luckyColor: "Grey & Electric Blue",
    luckyDay: "Saturday",
    gemstone: "Hessonite (Gomed)",
    compatible: [1, 5, 6, 7],
    personality:
      "Ruled by Rahu, Mulank 4 people are practical, hardworking, and quietly unconventional. You build things to last and approach life with discipline and method. You often see the world differently from those around you, which gives you an original, problem-solving mind once people learn to trust your unusual perspective.",
    strengths: [
      "Reliable and methodical",
      "Hardworking and persistent",
      "Practical, grounded problem-solver",
      "Loyal and dependable",
    ],
    weaknesses: [
      "Can be rigid or resistant to change",
      "Prone to overthinking and worry",
      "May feel misunderstood or isolated",
      "Holds on to grudges",
    ],
    careers: [
      "Engineering and construction",
      "Technology and systems",
      "Operations and project management",
      "Research and skilled trades",
    ],
    careerDetail:
      "Mulank 4 builds wealth the way it builds everything — brick by brick, system by system. Your professional edge is that you actually finish what others only plan, and modern fields reward this generously: technology, infrastructure, operations, anything with complex moving parts. Expect your breakthrough later than flashier colleagues and trust the compounding; Rahu's natives often overtake everyone in the second half of their careers. Avoid speculative shortcuts — quick-money schemes treat 4s unusually harshly.",
    love:
      "Mulank 4 loves through reliability: showing up, providing, remembering, fixing. You are slower to open up than most, and partners sometimes mistake your steadiness for distance — learn to say in words what you already prove in actions. You need a mate who values loyalty over drama and gives you room for your routines. The mental agility of 5, the warmth of 6, and the quiet depth of 7 suit you well; pairings with 8 bring shared seriousness but need conscious lightness.",
    health:
      "Rahu's restlessness lives in the nervous system, so Mulank 4's health battles are usually fought in the mind first — worry, overthinking, and disrupted sleep. A firm daily routine is your strongest medicine: fixed meals, fixed sleep, regular exercise. Watch the tendency to sit for long working hours; your body needs movement as much as your projects need your attention.",
    year2026:
      "2026's Universal Year 1 hands the builder a blank site. Rahu's natives often hesitate at beginnings, preferring to perfect the plan — but in a 1 year, started beats perfect. Lay the foundation of the venture, skill, or system you intend to spend the next decade on. Unconventional choices made this year (a new-age field, a foreign opportunity, a technology bet) carry Rahu's special blessing.",
    remedy:
      "Offer food and water to birds and stray animals daily; keeping a square piece of silver and donating on Saturdays helps balance Rahu's restless energy.",
    faqs: [
      {
        q: "Which birth dates give Mulank 4?",
        a: "Anyone born on the 4th, 13th, 22nd, or 31st of any month has Mulank 4, because the digits of the birth day reduce to 4 (for example 31 → 3 + 1 = 4).",
      },
      {
        q: "Is Mulank 4 unlucky?",
        a: "No — Mulank 4 is misunderstood rather than unlucky. Ruled by Rahu, it brings unconventional paths and later-blooming success. Natives who stay disciplined and avoid shortcuts often build more lasting wealth and security than faster-starting numbers.",
      },
      {
        q: "Who should Mulank 4 marry?",
        a: "Mulank 4 harmonises best with 1, 5, 6, and 7. Number 5 lightens their seriousness, 6 warms their home life, and 7 shares their depth. A 4 needs a loyal partner who values steadiness over spectacle.",
      },
      {
        q: "Which career is best for Mulank 4?",
        a: "Engineering, technology, operations, project management, research, and skilled trades suit Mulank 4 best. They excel wherever method, persistence, and systems thinking are rewarded, and should avoid speculative ventures.",
      },
    ],
  },
  5: {
    number: 5,
    planet: "Mercury",
    meaning: "Adaptable, adventurous, communicator",
    luckyColor: "Green",
    luckyDay: "Wednesday",
    gemstone: "Emerald",
    compatible: [1, 3, 5, 6, 9],
    personality:
      "Ruled by Mercury, Mulank 5 people are quick-witted, adaptable, and endlessly curious. You crave variety and freedom, learn fast, and communicate with ease. A natural networker, you thrive on change and new experiences, and you have a remarkable ability to connect with people from every walk of life.",
    strengths: [
      "Versatile and quick-thinking",
      "Excellent communicator",
      "Adventurous and open-minded",
      "Resilient and resourceful",
    ],
    weaknesses: [
      "Restless and easily bored",
      "Can be impulsive or scattered",
      "Difficulty committing long-term",
      "Prone to nervous tension",
    ],
    careers: [
      "Sales, marketing and PR",
      "Trading, business and commerce",
      "Journalism and communication",
      "Travel, events and entrepreneurship",
    ],
    careerDetail:
      "Mercury makes Mulank 5 the born dealmaker — you can sell, negotiate, write, and connect, often all in the same afternoon. Business suits you better than most numbers because you read markets and people quickly, and multiple income streams feel natural rather than stressful. Your risk is the unfinished portfolio: ventures abandoned at 80% because something newer sparkled. Pair your speed with one patient system (or one patient person) that forces completion, and your earnings multiply.",
    love:
      "Mulank 5 needs a relationship that feels like an adventure, not an anchor. You bring wit, spontaneity, and genuine curiosity about your partner — boredom, not conflict, is what kills love for you. The right mate keeps growing and gives you breathing room; possessiveness makes you bolt. The steadiness of 1, the playfulness of 3, and the charm of 6 all work well, and two 5s share a thrilling, fast-moving life as long as someone remembers to pay the bills.",
    health:
      "Mercury rules the nervous system, skin, and breath — so stress shows up quickly and visibly on a 5. Your mind runs fast by design; without regular discharge it turns on itself as anxiety and restlessness. Exercise that doubles as play (sport, dance, cycling) suits you better than grim gym routines, and breathwork or pranayama is almost tailor-made for Mercury natives.",
    year2026:
      "A Universal Year 1 rewards exactly what Mulank 5 does best: starting. In 2026 your ideas find unusually receptive ground — the pitch lands, the audience responds, the trade opens. The discipline is selection: list your ten ideas, launch the best one properly, and park the other nine. A 1 year gives momentum to whatever you begin, including scattered beginnings, so aim the momentum deliberately.",
    remedy:
      "Donate green gram (moong dal) on Wednesdays and offer fresh grass to cows; wearing green strengthens Mercury and steadies a restless mind.",
    faqs: [
      {
        q: "Which birth dates give Mulank 5?",
        a: "Anyone born on the 5th, 14th, or 23rd of any month has Mulank 5, because the digits of the birth day reduce to 5 (for example 23 → 2 + 3 = 5).",
      },
      {
        q: "Is Mulank 5 lucky for business?",
        a: "Mulank 5 is widely considered the best business number in Vedic numerology. Mercury rules commerce, communication, and negotiation, giving natives natural talent for trade, marketing, and building multiple income streams.",
      },
      {
        q: "Who should Mulank 5 marry?",
        a: "Mulank 5 harmonises best with 1, 3, 5, 6, and 9. They need a partner who enjoys variety and growth — possessive or routine-bound matches feel suffocating to Mercury natives, however loving they may be.",
      },
      {
        q: "Which career is best for Mulank 5?",
        a: "Sales, marketing, trading, journalism, PR, travel, and entrepreneurship suit Mulank 5 best — any fast-moving field built on communication. They outperform wherever adaptability and networking decide success.",
      },
    ],
  },
  6: {
    number: 6,
    planet: "Venus",
    meaning: "Nurturing, responsible, loving",
    luckyColor: "White & Soft Pink",
    luckyDay: "Friday",
    gemstone: "Diamond / Opal",
    compatible: [3, 5, 6, 9],
    personality:
      "Ruled by Venus, Mulank 6 people are loving, responsible, and drawn to beauty and harmony. You care deeply for family and home, and you have a natural sense of style and grace. Warm and dependable, you are the person others lean on, and you find true fulfilment in nurturing the people and things you love.",
    strengths: [
      "Caring and responsible",
      "Strong sense of beauty and harmony",
      "Loyal and family-oriented",
      "Charming and sociable",
    ],
    weaknesses: [
      "Can be possessive or over-attached",
      "Tendency to worry over loved ones",
      "May indulge in comfort and luxury",
      "Avoids confrontation to a fault",
    ],
    careers: [
      "Hospitality and interior design",
      "Fashion, beauty and the arts",
      "Healthcare and social work",
      "Luxury, food and event businesses",
    ],
    careerDetail:
      "Venus pays Mulank 6 for taste. Wherever beauty, comfort, or care can be monetised — hospitality, design, fashion, food, wellness, events — your instincts are commercial gold, because you genuinely feel what makes an experience delightful. Clients and colleagues trust you quickly; your charm opens doors that credentials alone cannot. The financial watch-point is lifestyle inflation: Venus loves to spend on beauty as fast as it earns. Build the habit of investing before indulging.",
    love:
      "Love is Mulank 6's native language — you are the most naturally devoted partner in numerology, attentive, romantic, and deeply invested in home. You give enormously and, quietly, keep score; resentment builds when giving is not returned in kind, so learn to ask rather than silently expect. Guard against smothering those you love with care. The idealism of 9, the liveliness of 5, and the wisdom of 3 pair beautifully; two 6s create a warm, lovely home and must simply avoid competing over who sacrifices more.",
    health:
      "Venus rules the throat, face, kidneys, and the sweet tooth. Mulank 6's health risks are the comfortable kind — rich food, late desserts, too little movement wrapped in a beautiful routine. The remedy is equally pleasant: make health an aesthetic. Beautiful walks, good ingredients cooked well, dance, skincare-as-discipline. You maintain what you find beautiful, so design your wellbeing accordingly.",
    year2026:
      "2026's Universal Year 1 asks the nurturer to put themselves first for once — and blesses it. Start the venture that carries your taste, whether a studio, boutique, practice, or home business; Venus-ruled natives who launch in a 1 year often find their aesthetic becomes their income. In relationships, the year favours bold commitments: proposals, marriages, and new family chapters begun now take deep root.",
    remedy:
      "Keep your home clean, fragrant, and beautiful, and offer white flowers or white sweets on Fridays to honour Venus and invite harmony.",
    faqs: [
      {
        q: "Which birth dates give Mulank 6?",
        a: "Anyone born on the 6th, 15th, or 24th of any month has Mulank 6, because the digits of the birth day reduce to 6 (for example 24 → 2 + 4 = 6).",
      },
      {
        q: "Is Mulank 6 lucky?",
        a: "Mulank 6 is ruled by Venus and is considered highly fortunate for love, marriage, comfort, and artistic success. Natives typically enjoy charm, good taste, and strong family bonds — their luck grows through relationships.",
      },
      {
        q: "Who should Mulank 6 marry?",
        a: "Mulank 6 harmonises best with 3, 5, 6, and 9. Number 9's devotion matches their depth of care, and 3 brings shared values and warmth. A 6 needs a partner who returns affection visibly, not just silently.",
      },
      {
        q: "Which career is best for Mulank 6?",
        a: "Hospitality, interior design, fashion, beauty, the arts, food, luxury retail, and caregiving professions suit Mulank 6 best. They excel wherever taste, charm, and genuine care for people create value.",
      },
    ],
  },
  7: {
    number: 7,
    planet: "Ketu",
    meaning: "Spiritual, introspective, wise",
    luckyColor: "Smoky Grey & White",
    luckyDay: "Monday",
    gemstone: "Cat's Eye",
    compatible: [1, 2, 4, 7],
    personality:
      "Ruled by Ketu, Mulank 7 people are thoughtful, intuitive, and naturally spiritual. You are drawn to the deeper questions of life and prefer meaning over the material. Independent and observant, you need solitude to recharge, and your quiet wisdom and analytical mind often see what others miss.",
    strengths: [
      "Deep, analytical thinker",
      "Intuitive and spiritually inclined",
      "Independent and self-aware",
      "Calm under pressure",
    ],
    weaknesses: [
      "Can be withdrawn or aloof",
      "Prone to overthinking and detachment",
      "Hard to open up emotionally",
      "May seem secretive or distant",
    ],
    careers: [
      "Research and analysis",
      "Spirituality, healing and philosophy",
      "Science and technology",
      "Writing, photography and the arts",
    ],
    careerDetail:
      "Mulank 7 earns as the specialist others cannot replace. Your mind goes deeper than the room — into data, systems, texts, or the human psyche — and your career flourishes once you stop competing on visibility and start charging for depth. Research, analysis, healing arts, and technical mastery all suit you; management for its own sake rarely does. Reputation arrives quietly through work quality, and one strong advocate who promotes you is worth ten networking events you would have hated anyway.",
    love:
      "Mulank 7 loves deeply but privately — your inner world is vast, and you invite very few people all the way in. Partners can misread your need for solitude as rejection; the relationship transforms once you explain that alone time restores rather than excludes. You need a mate who is comfortable with silence and depth over constant social noise. The gentle Moon-ruled 2 understands you intuitively, 4 shares your seriousness, and 1 gives the relationship direction while respecting your interior life.",
    health:
      "Ketu's influence makes the mind–body link unusually strong in Mulank 7 — unprocessed thoughts surface as fatigue, digestive trouble, or vague unease that tests cannot explain. Meditation is not optional self-care for you; it is your primary health system. Time in nature, moderate routine, and limiting stimulants (Ketu natives are sensitive to them) keep both mind and body clear.",
    year2026:
      "A Universal Year 1 pulls even the hermit toward a new beginning — and for Mulank 7 in 2026, the right launch is one with meaning at its core. Begin the research project, the healing practice, the book, the study that you would pursue even unpaid. Public ambition for its own sake will feel hollow this year; purpose-driven starts will attract support without your chasing it.",
    remedy:
      "Feed dogs regularly and set aside time each day for silent meditation or prayer; this honours Ketu and channels your introspective energy.",
    faqs: [
      {
        q: "Which birth dates give Mulank 7?",
        a: "Anyone born on the 7th, 16th, or 25th of any month has Mulank 7, because the digits of the birth day reduce to 7 (for example 25 → 2 + 5 = 7).",
      },
      {
        q: "Is Mulank 7 spiritual?",
        a: "Yes — Mulank 7 is ruled by Ketu, the planet of moksha and detachment, making it the most spiritually inclined birth number. Natives are drawn to philosophy, meditation, research, and life's deeper questions from an early age.",
      },
      {
        q: "Who should Mulank 7 marry?",
        a: "Mulank 7 harmonises best with 1, 2, 4, and 7. Mulank 2 offers the emotional understanding a private 7 needs, while 4 shares their depth and loyalty. The essential requirement is a partner who respects solitude.",
      },
      {
        q: "Which career is best for Mulank 7?",
        a: "Research, data and analysis, science, spirituality, healing, psychology, writing, and photography suit Mulank 7 best. They thrive as respected specialists and struggle in shallow, purely social roles.",
      },
    ],
  },
  8: {
    number: 8,
    planet: "Saturn",
    meaning: "Powerful, resilient, destined for greatness",
    luckyColor: "Dark Blue & Black",
    luckyDay: "Saturday",
    gemstone: "Blue Sapphire",
    compatible: [3, 5, 6],
    personality:
      "Ruled by Saturn, Mulank 8 people are ambitious, disciplined, and built for the long game. You understand that real success is earned through patience and persistence. Life may test you, but each test forges your remarkable resilience. Once you commit to a goal, few forces can stop you from reaching it.",
    strengths: [
      "Ambitious and goal-driven",
      "Exceptionally resilient",
      "Organised and responsible",
      "Strong sense of justice",
    ],
    weaknesses: [
      "Can be rigid or workaholic",
      "Prone to pessimism in setbacks",
      "Struggles to express emotion",
      "May carry the weight of others",
    ],
    careers: [
      "Business and finance",
      "Law, justice and administration",
      "Real estate and infrastructure",
      "Leadership in large organisations",
    ],
    careerDetail:
      "Saturn structures Mulank 8's career as a test with an enormous prize. Early years often bring more work for less recognition than peers receive — and this is precisely the training. Your advantages compound with time: institutional trust, deep competence, and the stamina to outlast every rival. Finance, law, real estate, administration, and large organisations reward your gravity. Never cut ethical corners; Saturn audits 8s more strictly than anyone, and equally, no number is repaid more handsomely for integrity.",
    love:
      "Mulank 8 loves seriously — you commit fully or not at all, and you show devotion through responsibility: securing the future, standing by your partner in difficulty, keeping every promise. Words and displays of tenderness come harder, and partners may need reassurance that your quietness is depth, not indifference. Give it in words sometimes. The cheerfulness of 3, the adaptability of 5, and the warmth of 6 soften Saturn's weight beautifully; these matches bring the lightness your life otherwise rations.",
    health:
      "Saturn rules bones, joints, teeth, and the long-term consequences of neglect — 8s rarely fall ill dramatically, they wear down gradually while working. Your health strategy is structural, like everything you do: fixed sleep, strength training to protect the frame, and scheduled rest treated as an appointment with yourself. Watch knees and back, and do not postpone the check-up you have been postponing.",
    year2026:
      "For the number that waits, 2026's Universal Year 1 is the starting gun. Saturn natives often delay beginnings until conditions are perfect — but a 1 year rewards those who move, and efforts begun now mature into exactly the kind of long-term positions 8 excels at holding. Start the business, buy the property, take the role. Plant this year what you intend to harvest for a decade.",
    remedy:
      "Light a mustard-oil lamp on Saturdays and serve or help labourers and the underprivileged; selfless service softens Saturn's hard lessons.",
    faqs: [
      {
        q: "Which birth dates give Mulank 8?",
        a: "Anyone born on the 8th, 17th, or 26th of any month has Mulank 8, because the digits of the birth day reduce to 8 (for example 26 → 2 + 6 = 8).",
      },
      {
        q: "Is Mulank 8 unlucky?",
        a: "No — Mulank 8 is demanding, not unlucky. Saturn delays rewards but multiplies them: natives who stay disciplined and ethical typically achieve greater wealth and authority in maturity than any faster-starting number.",
      },
      {
        q: "Who should Mulank 8 marry?",
        a: "Mulank 8 harmonises best with 3, 5, and 6. These numbers bring the optimism, flexibility, and warmth that balance Saturn's seriousness. An 8 needs a patient partner who reads devotion in actions, not just words.",
      },
      {
        q: "Which career is best for Mulank 8?",
        a: "Business, finance, law, judiciary, administration, real estate, and leadership in large organisations suit Mulank 8 best. They excel in careers where authority is earned over time and endurance is rewarded.",
      },
    ],
  },
  9: {
    number: 9,
    planet: "Mars",
    meaning: "Humanitarian, courageous, passionate",
    luckyColor: "Red & Crimson",
    luckyDay: "Tuesday",
    gemstone: "Red Coral",
    compatible: [1, 2, 3, 6, 9],
    personality:
      "Ruled by Mars, Mulank 9 people are courageous, energetic, and driven by a strong sense of purpose. You feel deeply, fight for what is right, and pour passion into everything you do. A natural protector and humanitarian, you are happiest when your considerable energy is in service of a cause greater than yourself.",
    strengths: [
      "Courageous and determined",
      "Compassionate and humanitarian",
      "Energetic and hardworking",
      "Loyal and protective",
    ],
    weaknesses: [
      "Quick temper and impatience",
      "Can be impulsive or combative",
      "Restless when unchallenged",
      "Tendency to overexert",
    ],
    careers: [
      "Defence, sports and fitness",
      "Surgery and emergency services",
      "Social causes and activism",
      "Engineering and leadership roles",
    ],
    careerDetail:
      "Mars gives Mulank 9 an engine most careers cannot fully use — which is why the wrong job feels like a cage and the right one like a calling. You excel under pressure, in crises, and wherever courage is the qualifying skill: defence, medicine, sport, activism, demanding leadership. Money matters to you mainly as fuel for the mission and the people you protect. Choose employers and causes worthy of your loyalty, because you will give them everything.",
    love:
      "Mulank 9 loves the way it does everything — completely, protectively, and with fire. You are a passionate, generous partner who would walk through walls for family; the same fire, unmanaged, flares into arguments that wound more than you intend. Learn to pause before the sharp word: your partner is not the opponent. The calm of 2 soothes you, 1 matches your strength with mutual respect, and 6's devotion answers your protectiveness. Two 9s share a heroic, stormy, deeply loyal bond.",
    health:
      "Mars rules blood, muscles, and heat — Mulank 9 carries real physical power and, with it, a tendency toward inflammation, injuries from overexertion, and blood-pressure spikes when anger runs unchecked. You need hard exercise the way others need rest; a sedentary week makes you irritable before it makes you unfit. Train regularly, cool the diet down, and treat anger management as athletic training for the mind.",
    year2026:
      "2026's Universal Year 1 pairs the Sun's initiative with your Martian drive — an explosive combination for launches that demand courage. The campaign, the cause, the physical challenge, the leadership bid you have been circling: this is the year to charge. Direct the energy at one worthy objective; scattered fire burns fields, focused fire forges steel.",
    remedy:
      "Donate red masoor (lentils) on Tuesdays and channel your energy into regular physical exercise; offering water at a Hanuman temple calms Mars.",
    faqs: [
      {
        q: "Which birth dates give Mulank 9?",
        a: "Anyone born on the 9th, 18th, or 27th of any month has Mulank 9, because the digits of the birth day reduce to 9 (for example 27 → 2 + 7 = 9).",
      },
      {
        q: "Is Mulank 9 powerful?",
        a: "Yes — Mulank 9 is ruled by Mars, the warrior planet, and is considered the number of courage, completion, and humanitarian power. Natives carry exceptional energy and rise fastest in causes larger than themselves.",
      },
      {
        q: "Who should Mulank 9 marry?",
        a: "Mulank 9 harmonises best with 1, 2, 3, 6, and 9. The gentle 2 calms Mars's fire, 6 matches their devotion, and 1 offers a partnership of equals. A 9 needs a partner who is never treated as the opponent in arguments.",
      },
      {
        q: "Which career is best for Mulank 9?",
        a: "Defence, police, sports, surgery, emergency services, engineering, activism, and demanding leadership roles suit Mulank 9 best — careers where courage, energy, and protective instinct are daily requirements.",
      },
    ],
  },
};

export const MULANK_NUMBERS: MulankNumber[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

/** Birth days of the month that reduce to the given Mulank (e.g. 1 → 1, 10, 19, 28). */
export function mulankBirthDays(n: MulankNumber): number[] {
  return [n, n + 9, n + 18, n + 27].filter((d) => d <= 31);
}
