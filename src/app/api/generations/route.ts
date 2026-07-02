import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { generations } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ items: [] });

  const rows = await db
    .select()
    .from(generations)
    .where(eq(generations.userId, user.id))
    .orderBy(desc(generations.createdAt))
    .limit(60);

  return NextResponse.json({
    items: rows.map((r) => ({
      id: r.id,
      type: r.type,
      model: r.model,
      prompt: r.prompt,
      status: r.status,
      outputUrl: r.outputUrl,
      meta: r.outputMeta,
      createdAt: r.createdAt,
      creditsUsed: r.creditsUsed,
      settings: r.settings,
    })),
  });
}
