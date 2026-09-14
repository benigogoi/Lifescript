/**
 * Mystic Digits — ad landing pages (/posters/[slug]).
 *
 * One entry per Meta ad audience. To launch Mulank 1, 3, 6 or 9, add an entry
 * to POSTERS below — the route, heading, birth dates, price and buttons are all
 * derived, so no new page is needed.
 *
 * Copy is Hindi, but the report itself isn't available in Hindi yet
 * (report-lang.ts: 'hi' is reserved, no pack), so every page says so plainly.
 */
import type { MulankNumber } from "./mulank-content";

export interface Poster {
  mulank: MulankNumber;
  /** 3–4 short, real trait lines shown free below the fold. */
  traits: string[];
}

export const POSTERS: Record<string, Poster> = {
  "mulank-5": {
    mulank: 5,
    traits: [
      "बुध ग्रह से प्रभावित मूलांक 5 के लोग तेज़ दिमाग़ वाले, जिज्ञासु और हर माहौल में ढल जाने वाले होते हैं।",
      "बात करना, समझाना और लोगों से जुड़ना आपको स्वाभाविक रूप से आता है — व्यापार, सेल्स और मार्केटिंग आपके लिए बने हैं।",
      "आपकी सबसे बड़ी चुनौती है जल्दी ऊब जाना — कई काम शुरू होते हैं, पर पूरे कम हो पाते हैं।",
      "2026 शुरुआत का साल है: आपकी नई योजना को ज़मीन मिलेगी, बस दस में से एक चुनिए और उसे पूरा कीजिए।",
    ],
  },
};

export const POSTER_SLUGS = Object.keys(POSTERS);

/** Shared Hindi UI copy, identical on every poster. */
export const POSTER_COPY = {
  heading: (n: MulankNumber) => `मूलांक ${n} — आपकी 2026 रिपोर्ट`,
  inside: "लो शू ग्रिड · शुभ रंग, दिन और रत्न · उपाय · मंत्र",
  cta: "रिपोर्ट पाएं",
  priceNote: "एक बार का भुगतान · 24 घंटे में ईमेल पर",
  langNote: "रिपोर्ट अंग्रेज़ी में आती है",
  traitsHeading: (n: MulankNumber) => `मूलांक ${n} के लोग कैसे होते हैं`,
} as const;
