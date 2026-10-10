import { cookies } from "next/headers";
import crypto from "node:crypto";

const SECRET =
  process.env.SESSION_SECRET ?? "nature-dev-secret-trocar-em-producao";
const COOKIE = "np_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 dias

export type SessionUser = {
  uid: number;
  name: string;
  email: string;
  role: "customer" | "admin";
};

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return (
    candidate.length === expected.length &&
    crypto.timingSafeEqual(candidate, expected)
  );
}

function hmac(payload: string): string {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
}

export function signToken(user: SessionUser, exp: number): string {
  const payload = Buffer.from(JSON.stringify({ ...user, exp })).toString(
    "base64url"
  );
  return `${payload}.${hmac(payload)}`;
}

export function verifyToken(token: string): SessionUser | null {
  const [payload, sig] = token.split(".");
  if (!payload || !sig || hmac(payload) !== sig) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (!data.exp || data.exp < Math.floor(Date.now() / 1000)) return null;
    return { uid: data.uid, name: data.name, email: data.email, role: data.role };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function setSessionCookie(user: SessionUser) {
  const store = await cookies();
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  store.set(COOKIE, signToken(user, exp), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE,
    path: "/",
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.set(COOKIE, "", { maxAge: 0, path: "/" });
}
