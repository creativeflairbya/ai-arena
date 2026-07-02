import { NextResponse } from "next/server";
import { db } from "@/db";
import { generations } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";

export async function GET() {
  // Public showcase: latest completed generations from all users,
  // but strip user identifiers.
  const rows = await db
    .select({
      id: generations.id,
      type: generations.type,
      model: generations.model,
      prompt: generations.prompt,
      outputUrl: generations.outputUrl,
      meta: generations.outputMeta,
      createdAt: generations.createdAt,
    })
    .from(generations)
    .where(eq(generations.status, "completed"))
    .orderBy(desc(generations.createdAt))
    .limit(24);

  return NextResponse.json({ items: rows });
}
