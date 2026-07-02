/**
 * Mystic Digits — traffic attribution capture.
 *
 * Answers "where did this customer come from?" independently of GA4/Meta, so
 * every order row in Supabase carries its own origin story.
 *
 * Model: a "touch" is a landing with campaign params (utm_*, gclid, fbclid)
 * or an external referrer. First touch is stored in localStorage once and
 * never overwritten (survives across sessions); last touch lives in
 * localStorage too but is refreshed by every new campaign/referral landing.
 * Direct revisits never erase a known source.
 */

export interface Touch {
  /** utm_source, or derived from the referrer when no params present. */
  source: string;
  medium: string | null;
  campaign: string | null;
  term: string | null;
  content: string | null;
  gclid: string | null;
  fbclid: string | null;
  referrer: string | null;
  landing_page: string | null;
  at: string;
}

export interface Attribution {
  first_touch: Touch;
  last_touch: Touch;
}

const FIRST_KEY = "md_attribution_first";
const LAST_KEY = "md_attribution_last";

/** Referrer hostname → friendly source name for non-UTM traffic. */
function sourceFromReferrer(host: string): string {
  const h = host.toLowerCase();
  if (h.includes("instagram")) return "instagram";
  if (h.includes("facebook") || h === "fb.com" || h.endsWith(".fb.com")) return "facebook";
  if (h.includes("whatsapp")) return "whatsapp";
  if (h.includes("google")) return "google";
  if (h.includes("bing")) return "bing";
  if (h.includes("duckduckgo")) return "duckduckgo";
  if (h.includes("youtube")) return "youtube";
  if (h.includes("chatgpt") || h.includes("openai")) return "chatgpt";
  if (h.includes("perplexity")) return "perplexity";
  if (h.includes("claude.ai") || h.includes("anthropic")) return "claude";
  if (h.includes("gemini")) return "gemini";
  if (h.includes("t.co") || h.includes("twitter") || h === "x.com") return "twitter";
  if (h.includes("linkedin")) return "linkedin";
  if (h.includes("reddit")) return "reddit";
  if (h.includes("telegram")) return "telegram";
  return h;
}

function readStored(key: string): Touch | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Touch) : null;
  } catch {
    return null;
  }
}

function store(key: string, touch: Touch) {
  try {
    window.localStorage.setItem(key, JSON.stringify(touch));
  } catch {
    // Storage blocked — attribution degrades gracefully to null.
  }
}

/**
 * Record the current landing as a touch if it carries any signal.
 * Call once per page load (the root layout mounts <AttributionCapture />).
 */
export function captureAttribution() {
  if (typeof window === "undefined") return;

  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get("utm_source");
  const gclid = params.get("gclid");
  const fbclid = params.get("fbclid");

  let referrerHost: string | null = null;
  try {
    if (document.referrer) {
      const host = new URL(document.referrer).hostname;
      // Ignore self-referrals (internal navigation on hard loads).
      if (host && host !== window.location.hostname) referrerHost = host;
    }
  } catch {
    // Malformed referrer — treat as absent.
  }

  const hasCampaign = Boolean(utmSource || gclid || fbclid);
  const hasSignal = hasCampaign || Boolean(referrerHost);
  const alreadyFirst = readStored(FIRST_KEY);

  // A signal-less landing is only worth recording as "direct" when we know
  // nothing yet; it must never overwrite a real source on a revisit.
  if (!hasSignal && alreadyFirst) return;

  const source = utmSource
    ? utmSource.toLowerCase()
    : gclid
      ? "google"
      : fbclid
        ? "facebook"
        : referrerHost
          ? sourceFromReferrer(referrerHost)
          : "direct";

  const touch: Touch = {
    source,
    medium:
      params.get("utm_medium")?.toLowerCase() ??
      (gclid ? "cpc" : fbclid ? "paid_social" : referrerHost ? "referral" : null),
    campaign: params.get("utm_campaign"),
    term: params.get("utm_term"),
    content: params.get("utm_content"),
    gclid,
    fbclid,
    referrer: document.referrer || null,
    landing_page: window.location.pathname + window.location.search,
    at: new Date().toISOString(),
  };

  if (!alreadyFirst) store(FIRST_KEY, touch);
  store(LAST_KEY, touch);
}

/** The attribution snapshot to attach to an order at checkout. */
export function getAttribution(): Attribution | null {
  if (typeof window === "undefined") return null;
  const first = readStored(FIRST_KEY);
  const last = readStored(LAST_KEY);
  if (!first && !last) return null;
  return {
    first_touch: (first ?? last) as Touch,
    last_touch: (last ?? first) as Touch,
  };
}
