import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  credits: number;
  subscriptionTier: string | null;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createToken(user: SessionUser): Promise<string> {
  return new SignJWT({ user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload.user as SessionUser;
  } catch {
    return null;
  }
}

export async function authenticateUser(email: string, password: string) {
  const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
  
  if (user.length === 0) {
    return null;
  }

  const validPassword = await verifyPassword(password, user[0].password);
  if (!validPassword) {
    return null;
  }

  return {
    id: user[0].id,
    email: user[0].email,
    name: user[0].name,
    role: user[0].role,
    credits: user[0].credits,
    subscriptionTier: user[0].subscriptionTier,
  };
}
