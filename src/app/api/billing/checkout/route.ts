import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { transactions, subscriptions, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getPlan, type PlanKey } from "@/lib/plans";
import { z } from "zod";

const Body = z.object({
  plan: z.enum(["pro", "studio", "enterprise"]),
  method: z.enum(["stripe", "jazzcash", "easypaisa", "bank_transfer", "manual"]),
  reference: z.string().max(120).optional(),
  proofNote: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
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
  const { plan, method, reference, proofNote } = parsed.data;
  const planDef = getPlan(plan as PlanKey);

  // Free plan checkout is meaningless
  if (planDef.pkrPrice === 0) {
    return NextResponse.json({ error: "Free plan does not require payment" }, { status: 400 });
  }

  const isLocal = method === "jazzcash" || method === "easypaisa" || method === "bank_transfer";
  const amount = isLocal ? planDef.pkrPrice * 100 : planDef.usdPrice * 100; // smallest unit
  const currency = isLocal ? "PKR" : "USD";

  // For Stripe in a sandbox, we simulate success immediately.
  // For local methods, we record a pending transaction; master/admin will
  // confirm and credits are then added.
  const autoComplete = method === "stripe";

  const [tx] = await db
    .insert(transactions)
    .values({
      userId: user.id,
      plan,
      method,
      status: autoComplete ? "completed" : "pending",
      amount,
      currency,
      reference: reference ?? null,
      proofNote: proofNote ?? null,
      creditsGranted: autoComplete ? planDef.monthlyCredits : 0,
      completedAt: autoComplete ? new Date() : null,
    })
    .returning();

  if (autoComplete) {
    // Apply the subscription + credits
    await db
      .update(users)
      .set({
        plan,
        credits: planDef.monthlyCredits,
        isUnlimited: user.role === "master",
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));
    const expires = new Date();
    expires.setDate(expires.getDate() + 30);
    await db.insert(subscriptions).values({
      userId: user.id,
      plan,
      status: "active",
      expiresAt: expires,
      creditsPerMonth: planDef.monthlyCredits,
      amountPaid: amount,
      currency,
    });
  }

  return NextResponse.json({
    ok: true,
    transaction: {
      id: tx.id,
      status: tx.status,
      method: tx.method,
      amount: tx.amount,
      currency: tx.currency,
      plan: tx.plan,
    },
    instructions: !autoComplete
      ? {
          title:
            method === "jazzcash"
              ? "Send payment to JazzCash"
              : method === "easypaisa"
                ? "Send payment to EasyPaisa"
                : "Bank transfer details",
          details: [
            method === "jazzcash" && "Send Rs. " + planDef.pkrPrice + " to 03XX-XXXXXXX (Arena AI)",
            method === "easypaisa" && "Send Rs. " + planDef.pkrPrice + " to 03XX-XXXXXXX (Arena AI)",
            method === "bank_transfer" && "HBL Account: XXXX-XXXX-XXXX | Meezan: XXXX-XXXX-XXXX",
            "Use your transaction reference: " + tx.id,
            "Your credits will appear within minutes of confirmation.",
          ].filter(Boolean) as string[],
        }
      : null,
  });
}
