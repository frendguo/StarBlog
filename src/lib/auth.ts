import { jwtVerify, SignJWT } from "jose";

const ITERATIONS = 100_000;
const HASH_LEN = 32;
const COOKIE_NAME = "starblog_session";
const COOKIE_TTL_SECONDS = 60 * 60 * 24; // 24h

function b64encode(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.byteLength; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}

function b64decode(s: string): Uint8Array {
  const bin = atob(s);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function pbkdf2(
  password: string,
  salt: Uint8Array,
  iterations: number,
  length: number
): Promise<Uint8Array> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: salt as BufferSource, iterations },
    key,
    length * 8
  );
  return new Uint8Array(bits);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await pbkdf2(password, salt, ITERATIONS, HASH_LEN);
  return `pbkdf2$${ITERATIONS}$${b64encode(salt)}$${b64encode(hash)}`;
}

export async function verifyPassword(
  password: string,
  stored: string
): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;
  const iterations = Number(parts[1]);
  const salt = b64decode(parts[2]);
  const expected = b64decode(parts[3]);
  const got = await pbkdf2(password, salt, iterations, expected.length);
  if (got.length !== expected.length) return false;
  let ok = 0;
  for (let i = 0; i < got.length; i++) ok |= got[i] ^ expected[i];
  return ok === 0;
}

interface SessionPayload {
  sub: string;
  iat: number;
  exp: number;
}

function getSecret(secret: string): Uint8Array {
  return new TextEncoder().encode(secret);
}

export async function signSession(
  username: string,
  secret: string
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return await new SignJWT({ sub: username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(now)
    .setExpirationTime(now + COOKIE_TTL_SECONDS)
    .sign(getSecret(secret));
}

export async function verifySession(
  token: string,
  secret: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(secret));
    if (typeof payload.sub !== "string" || typeof payload.exp !== "number") {
      return null;
    }
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE = COOKIE_NAME;
export const SESSION_TTL = COOKIE_TTL_SECONDS;
