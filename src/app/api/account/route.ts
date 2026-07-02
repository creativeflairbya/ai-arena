import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { generations, transactions, subscriptions } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const recentGens = await db
    .select()
    .from(generations)
    .where(eq(generations.userId, user.id))
    .orderBy(desc(generations.createdAt))
    .limit(12);

  const txs = await db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, user.id))
    .orderBy(desc(transactions.createdAt))
    .limit(20);

  const subs = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, user.id))
    .orderBy(desc(subscriptions.startedAt))
    .limit(5);

  // Count totals using separate aggregate queries
  const [imageCount] = await db
    .select({ c: sql<number>`COUNT(*)::int` })
    .from(generations)
    .where(
      sql`${generations.userId} = ${user.id} AND ${generations.type} = 'text_to_image'`,
    );
  const [videoCount] = await db
    .select({ c: sql<number>`COUNT(*)::int` })
    .from(generations)
    .where(
      sql`${generations.userId} = ${user.id} AND ${generations.type} IN ('text_to_video','image_to_video')`,
    );
  const [creditsSpent] = await db
    .select({ c: sql<number>`COALESCE(SUM(${generations.creditsUsed}),0)::int` })
    .from(generations)
    .where(sql`${generations.userId} = ${user.id}`);

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      plan: user.plan,
      credits: user.credits,
      isUnlimited: user.isUnlimited,
      avatarColor: user.avatarColor,
      createdAt: user.createdAt,
    },
    recent: recentGens,
    transactions: txs,
    subscriptions: subs,
    stats: {
      images: imageCount?.c ?? 0,
      videos: videoCount?.c ?? 0,
      creditsSpent: creditsSpent?.c ?? 0,
    },
  });
}
