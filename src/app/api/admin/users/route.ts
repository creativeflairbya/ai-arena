import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { hashPassword } from "@/lib/auth";

async function requireAdmin() {
  const u = await getCurrentUser();
  if (!u || (u.role !== "master" && u.role !== "admin")) return null;
  return u;
}

const COLORS = ["#8b5cf6", "#ec4899", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#a855f7"];

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const rows = await db.select().from(users).orderBy(desc(users.createdAt));
  return NextResponse.json({
    items: rows.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      plan: u.plan,
      credits: u.credits,
      isUnlimited: u.isUnlimited,
      isActive: u.isActive,
      avatarColor: u.avatarColor,
      createdAt: u.createdAt,
    })),
  });
}

const CreateBody = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  plan: z.enum(["free", "pro", "studio", "enterprise"]).default("free"),
  credits: z.number().int().min(0).default(50),
  isUnlimited: z.boolean().default(false),
  role: z.enum(["user", "admin", "master"]).default("user"),
});

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = CreateBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }
  const { email, password, name, plan, credits, isUnlimited, role } = parsed.data;

  const existing = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
  if (existing.length > 0) {
    return NextResponse.json({ error: "Email already exists" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const [created] = await db
    .insert(users)
    .values({
      email: email.toLowerCase(),
      passwordHash,
      name,
      role,
      plan,
      credits: isUnlimited ? 999999 : credits,
      isUnlimited,
      isActive: true,
      avatarColor: COLORS[Math.floor(Math.random() * COLORS.length)],
    })
    .returning();

  return NextResponse.json({ ok: true, user: { id: created.id, email: created.email } });
}
