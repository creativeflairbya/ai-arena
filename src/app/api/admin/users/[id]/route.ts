import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

async function requireAdmin() {
  const u = await getCurrentUser();
  if (!u || (u.role !== "master" && u.role !== "admin")) return null;
  return u;
}

const PatchBody = z.object({
  credits: z.number().int().min(0).optional(),
  isUnlimited: z.boolean().optional(),
  isActive: z.boolean().optional(),
  plan: z.enum(["free", "pro", "studio", "enterprise"]).optional(),
  role: z.enum(["user", "admin", "master"]).optional(),
  name: z.string().min(2).max(60).optional(),
});

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await ctx.params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = PatchBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }
  const updates: Record<string, unknown> = { updatedAt: new Date() };
  const data = parsed.data;
  if (data.credits !== undefined) updates.credits = data.credits;
  if (data.isUnlimited !== undefined) updates.isUnlimited = data.isUnlimited;
  if (data.isActive !== undefined) updates.isActive = data.isActive;
  if (data.plan !== undefined) updates.plan = data.plan;
  if (data.role !== undefined) updates.role = data.role;
  if (data.name !== undefined) updates.name = data.name;

  const [updated] = await db
    .update(users)
    .set(updates)
    .where(eq(users.id, id))
    .returning();
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, user: { id: updated.id, credits: updated.credits, isUnlimited: updated.isUnlimited } });
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const me = await requireAdmin();
  if (!me) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await ctx.params;
  if (id === me.id) {
    return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
  }
  await db.delete(users).where(eq(users.id, id));
  return NextResponse.json({ ok: true });
}
