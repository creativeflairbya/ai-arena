import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  hashPassword,
  createSessionToken,
  setSessionCookie,
} from "@/lib/auth";
import { z } from "zod";

const Body = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2).max(60),
});

const COLORS = [
  "#8b5cf6", "#ec4899", "#06b6d4", "#10b981",
  "#f59e0b", "#ef4444", "#3b82f6", "#a855f7",
];

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }
  const { email, password, name } = parsed.data;

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, email));
  if (existing.length > 0) {
    return NextResponse.json(
      { error: "An account with that email already exists." },
      { status: 409 },
    );
  }

  const passwordHash = await hashPassword(password);
  const avatarColor = COLORS[Math.floor(Math.random() * COLORS.length)];

  const [created] = await db
    .insert(users)
    .values({
      email,
      passwordHash,
      name,
      role: "user",
      plan: "free",
      credits: 50,
      isUnlimited: false,
      isActive: true,
      avatarColor,
    })
    .returning();

  const token = await createSessionToken({
    id: created.id,
    email: created.email,
    role: created.role,
  });
  await setSessionCookie(token);

  return NextResponse.json({
    ok: true,
    user: {
      id: created.id,
      email: created.email,
      name: created.name,
      role: created.role,
      credits: created.credits,
      isUnlimited: created.isUnlimited,
      plan: created.plan,
    },
  });
}
