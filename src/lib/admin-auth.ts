/**
 * LifeScript — admin credential storage + verification.
 *
 * Server-only (Node). Credentials live in the `admin_credentials` singleton
 * row; until the owner sets a password via /admin/settings, login falls back
 * to ADMIN_PASSWORD/"admin" from env, so there's no manual DB seed step.
 */
import "server-only";
import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";
import { supabaseAdmin } from "./supabase";

const TABLE = "admin_credentials";

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyHash(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

interface StoredCredentials {
  username: string;
  password_hash: string;
}

async function getStoredCredentials(): Promise<StoredCredentials | null> {
  const { data, error } = await supabaseAdmin().from(TABLE).select("username, password_hash").eq("id", 1).maybeSingle();
  if (error) throw error;
  return (data as StoredCredentials) ?? null;
}

/** Verify a login attempt against the DB row, falling back to env defaults. */
export async function verifyAdminLogin(username: string, password: string): Promise<boolean> {
  const stored = await getStoredCredentials();
  if (stored) {
    return username === stored.username && verifyHash(password, stored.password_hash);
  }

  const envPassword = process.env.ADMIN_PASSWORD;
  if (!envPassword) return false;
  return username === "admin" && password === envPassword;
}

/** Set (or change) the admin username/password. */
export async function setAdminCredentials(username: string, password: string): Promise<void> {
  const password_hash = hashPassword(password);
  const { error } = await supabaseAdmin()
    .from(TABLE)
    .upsert({ id: 1, username, password_hash }, { onConflict: "id" });
  if (error) throw error;
}

/** Verify the *current* password before allowing a change, DB or env fallback. */
export async function verifyCurrentPassword(password: string): Promise<{ username: string } | null> {
  const stored = await getStoredCredentials();
  if (stored) {
    return verifyHash(password, stored.password_hash) ? { username: stored.username } : null;
  }
  const envPassword = process.env.ADMIN_PASSWORD;
  if (envPassword && password === envPassword) return { username: "admin" };
  return null;
}

export async function getAdminUsername(): Promise<string> {
  const stored = await getStoredCredentials();
  return stored?.username ?? "admin";
}
