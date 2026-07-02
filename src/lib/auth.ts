import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { sessions, users, type User } from "@/db/schema";
import { eq } from "drizzle-orm";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET ||
    "arena-studio-super-secret-key-change-me-in-production-please-make-it-long-enough",
);

const SESSION_COOKIE = "arena_session";
const SESSION_TTL_DAYS = 30;

export interface SessionPayload {
  userId: string;
  email: string;
  role: "master" | "admin" | "user";
  sessionId: string;
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function createSessionToken(
  user: Pick<User, "id" | "email" | "role">,
): Promise<string> {
  const expiresAt = new Date(
    Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000,
  );
  const sessionId = crypto.randomUUID();

  const token = await new SignJWT({
    userId: user.id,
    email: user.email,
    role: user.role,
    sessionId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(SECRET);

  await db.insert(sessions).values({
    id: sessionId,
    userId: user.id,
    token,
    expiresAt,
  });

  return token;
}

export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_DAYS * 24 * 60 * 60,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getSessionPayload(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as SessionPayload["role"],
      sessionId: payload.sessionId as string,
    };
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const payload = await getSessionPayload();
  if (!payload) return null;
  const [u] = await db.select().from(users).where(eq(users.id, payload.userId));
  return u ?? null;
}

export async function destroySession(sessionId: string) {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
