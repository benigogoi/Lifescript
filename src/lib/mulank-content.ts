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
  /** One practical, authentic Vedic remedy. */
  remedy: string;
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
    remedy:
      "Offer water to the rising Sun (Surya Arghya) each morning and keep a small piece of gold or copper with you to strengthen the Sun's energy.",
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
    remedy:
      "Drink water stored in a silver vessel and honour the mother figures in your life; offering milk on Mondays calms and strengthens the Moon.",
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
    remedy:
      "Apply a saffron or turmeric tilak on the forehead and show respect to teachers and elders; chanting a Guru mantra on Thursdays strengthens Jupiter.",
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
    remedy:
      "Offer food and water to birds and stray animals daily; keeping a square piece of silver and donating on Saturdays helps balance Rahu's restless energy.",
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
    remedy:
      "Donate green gram (moong dal) on Wednesdays and offer fresh grass to cows; wearing green strengthens Mercury and steadies a restless mind.",
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
    remedy:
      "Keep your home clean, fragrant, and beautiful, and offer white flowers or white sweets on Fridays to honour Venus and invite harmony.",
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
    remedy:
      "Feed dogs regularly and set aside time each day for silent meditation or prayer; this honours Ketu and channels your introspective energy.",
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
    remedy:
      "Light a mustard-oil lamp on Saturdays and serve or help labourers and the underprivileged; selfless service softens Saturn's hard lessons.",
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
    remedy:
      "Donate red masoor (lentils) on Tuesdays and channel your energy into regular physical exercise; offering water at a Hanuman temple calms Mars.",
  },
};

export const MULANK_NUMBERS: MulankNumber[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
