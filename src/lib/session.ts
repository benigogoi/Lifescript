/**
 * LifeScript — signed session cookie helpers.
 *
 * Uses Web Crypto (available in both the Node runtime and Next.js Edge
 * Middleware) so the same verify logic runs in middleware without pulling in
 * Node's `crypto` module there. Sessions are a simple signed-and-expiring
 * token, not a DB-backed session store — fine for a single-admin panel.
 */
const COOKIE_NAME = "admin_session";
const SESSION_DAYS = 7;

function secretKey(): string {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.CRON_SECRET;
  if (!secret) {
    throw new Error("Set ADMIN_SESSION_SECRET (or CRON_SECRET) in the environment.");
  }
  return secret;
}

async function hmac(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secretKey()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return Buffer.from(sig).toString("base64url");
}

export async function createSessionToken(username: string): Promise<string> {
  const payload = JSON.stringify({ u: username, exp: Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000 });
  const body = Buffer.from(payload, "utf8").toString("base64url");
  const sig = await hmac(body);
  return `${body}.${sig}`;
}

export async function verifySessionToken(token: string | undefined): Promise<{ username: string } | null> {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;

  const expected = await hmac(body);
  if (expected.length !== sig.length || !timingSafeEqual(expected, sig)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as {
      u: string;
      exp: number;
    };
    if (Date.now() > payload.exp) return null;
    return { username: payload.u };
  } catch {
    return null;
  }
}

function timingSafeEqual(a: string, b: string): boolean {
  let diff = a.length === b.length ? 0 : 1;
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}

export const SESSION_COOKIE = COOKIE_NAME;
export const SESSION_MAX_AGE_SEC = SESSION_DAYS * 24 * 60 * 60;
