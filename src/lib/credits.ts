import { db } from "@/db";
import { users, type User } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export const CREDIT_COSTS = {
  text_to_image: 1,
  text_to_video: 5,
  image_to_video: 6,
  video_enhance: 4,
  image_enhance: 2,
} as const;

export type GenerationKind = keyof typeof CREDIT_COSTS;

export function costFor(kind: GenerationKind): number {
  return CREDIT_COSTS[kind] ?? 1;
}

export function canAfford(user: User, kind: GenerationKind): boolean {
  if (user.isUnlimited) return true;
  return user.credits >= costFor(kind);
}

export async function safeDeduct(
  user: User,
  amount: number,
): Promise<{ ok: boolean; remaining: number }> {
  if (user.isUnlimited) return { ok: true, remaining: -1 };
  if (user.credits < amount) return { ok: false, remaining: user.credits };
  // Use a single SQL update with GREATEST for safety
  await db
    .update(users)
    .set({
      credits: sql`GREATEST(${users.credits} - ${amount}, 0)`,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));
  // Re-read for the true remaining count
  const [u] = await db
    .select({ credits: users.credits })
    .from(users)
    .where(eq(users.id, user.id));
  return { ok: true, remaining: u?.credits ?? 0 };
}

export async function addCredits(userId: string, amount: number) {
  await db
    .update(users)
    .set({ credits: sql`${users.credits} + ${amount}`, updatedAt: new Date() })
    .where(eq(users.id, userId));
}

export async function setCredits(userId: string, value: number) {
  await db
    .update(users)
    .set({ credits: Math.max(0, value), updatedAt: new Date() })
    .where(eq(users.id, userId));
}

export async function setUnlimited(userId: string, unlimited: boolean) {
  await db
    .update(users)
    .set({ isUnlimited: unlimited, updatedAt: new Date() })
    .where(eq(users.id, userId));
}
