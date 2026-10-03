import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "admin_session";
const SESSION_SECONDS = 60 * 60 * 24 * 7;

/** The admin area is closed unless ADMIN_PASSWORD is set. */
export function getAdminPassword(): string | null {
  return process.env.ADMIN_PASSWORD || null;
}

function digest(value: string): Buffer {
  return createHmac("sha256", "admin-compare").update(value).digest();
}

/** Constant-time password check. */
export function checkPassword(candidate: string): boolean {
  const password = getAdminPassword();
  if (!password) return false;
  return timingSafeEqual(digest(candidate), digest(password));
}

function sign(password: string, expires: number): string {
  return createHmac("sha256", password)
    .update(`admin:${expires}`)
    .digest("hex");
}

/** Token is `<expiry>.<hmac>`; it dies when the password changes. */
export function createSessionToken(now = Date.now()): string | null {
  const password = getAdminPassword();
  if (!password) return null;
  const expires = Math.floor(now / 1000) + SESSION_SECONDS;
  return `${expires}.${sign(password, expires)}`;
}

export function verifySessionToken(
  token: string | undefined,
  now = Date.now(),
): boolean {
  const password = getAdminPassword();
  if (!password || !token) return false;
  const [expiresRaw, signature] = token.split(".");
  const expires = Number(expiresRaw);
  if (!signature || !Number.isInteger(expires)) return false;
  if (expires < Math.floor(now / 1000)) return false;
  const expected = Buffer.from(sign(password, expires));
  const given = Buffer.from(signature);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(ADMIN_COOKIE)?.value);
}

export const SESSION_MAX_AGE = SESSION_SECONDS;
