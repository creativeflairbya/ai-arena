import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/auth";

const MASTER_EMAIL = "master@arena.ai";
const MASTER_PASSWORD = "Master@2024!";
const MASTER_NAME = "Master Admin";

export async function ensureMasterAccount(): Promise<{
  created: boolean;
  email: string;
}> {
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, MASTER_EMAIL));

  if (existing.length > 0) {
    // Make sure flags are correct even on subsequent boots
    const u = existing[0];
    if (!u.isUnlimited || u.role !== "master") {
      await db
        .update(users)
        .set({
          isUnlimited: true,
          role: "master",
          isActive: true,
          credits: 999999,
        })
        .where(eq(users.id, u.id));
    }
    return { created: false, email: MASTER_EMAIL };
  }

  const passwordHash = await hashPassword(MASTER_PASSWORD);
  await db.insert(users).values({
    email: MASTER_EMAIL,
    passwordHash,
    name: MASTER_NAME,
    role: "master",
    plan: "enterprise",
    credits: 999999,
    isUnlimited: true,
    isActive: true,
    avatarColor: "#8b5cf6",
  });

  return { created: true, email: MASTER_EMAIL };
}
