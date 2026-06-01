// Minimal, dependency-free JWT (HS256) using the Web Crypto API + Bun.password.
import { db } from "./db";
import type { AdminUser } from "@shared/types";

const SECRET =
  process.env.JWT_SECRET ?? "lyceum-dev-secret-change-me-in-production";
const enc = new TextEncoder();

function b64url(data: ArrayBuffer | Uint8Array | string): string {
  let bytes: Uint8Array;
  if (typeof data === "string") bytes = enc.encode(data);
  else if (data instanceof Uint8Array) bytes = data;
  else bytes = new Uint8Array(data);
  return Buffer.from(bytes)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function b64urlDecode(str: string): string {
  return Buffer.from(str.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString(
    "utf8",
  );
}

async function hmac(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return b64url(sig);
}

export interface TokenPayload {
  sub: number;
  email: string;
  role: string;
  exp: number; // unix seconds
}

export async function signToken(payload: Omit<TokenPayload, "exp">): Promise<string> {
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7; // 7 days
  const body = b64url(JSON.stringify({ ...payload, exp }));
  const sig = await hmac(`${header}.${body}`);
  return `${header}.${body}.${sig}`;
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, body, sig] = parts;
  const expected = await hmac(`${header}.${body}`);
  if (sig !== expected) return null;
  try {
    const payload = JSON.parse(b64urlDecode(body)) as TokenPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return Bun.password.hash(password, { algorithm: "bcrypt", cost: 10 });
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return Bun.password.verify(password, hash);
}

export function getUserFromRequest(req: Request): TokenPayload | null {
  // Returns a sync-resolved payload only if previously attached; see requireAuth.
  return (req as Request & { _user?: TokenPayload })._user ?? null;
}

export async function requireAuth(req: Request): Promise<AdminUser | null> {
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload) return null;
  const user = db
    .query("SELECT id, email, name, role, created_at FROM users WHERE id = ?")
    .get(payload.sub) as AdminUser | undefined;
  return user ?? null;
}
