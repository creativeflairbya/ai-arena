import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { generations } from "@/db/schema";
import { generateImage, type Aspect, type Style } from "@/lib/generator";
import { costFor, safeDeduct } from "@/lib/credits";
import { z } from "zod";

const Body = z.object({
  prompt: z.string().min(1).max(2000),
  negative: z.string().max(500).optional(),
  aspect: z.enum(["16:9", "9:16", "1:1", "4:3"]).default("1:1"),
  style: z
    .enum(["cinematic", "neon", "anime", "realistic", "abstract", "vintage"])
    .default("cinematic"),
  model: z.string().default("veo-2-pro"),
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
  const { prompt, negative, aspect, style, model } = parsed.data;
  const cost = costFor("text_to_image");

  if (!user.isUnlimited && user.credits < cost) {
    return NextResponse.json(
      { error: `You need ${cost} credits. Please top up or upgrade your plan.` },
      { status: 402 },
    );
  }

  const deduct = await safeDeduct(user, cost);
  if (!deduct.ok) {
    return NextResponse.json(
      { error: "Insufficient credits" },
      { status: 402 },
    );
  }

  const out = generateImage({
    prompt,
    negative,
    aspect: aspect as Aspect,
    style: style as Style,
    model,
  });

  // Persist
  const [row] = await db
    .insert(generations)
    .values({
      userId: user.id,
      type: "text_to_image",
      model,
      prompt,
      negativePrompt: negative,
      settings: { aspect, style },
      status: "completed",
      outputUrl: `data:image/svg+xml;utf8,${encodeURIComponent(out.svg)}`,
      outputMeta: { ...out.meta, width: out.width, height: out.height },
      creditsUsed: cost,
    })
    .returning();

  return NextResponse.json({
    ok: true,
    id: row.id,
    outputUrl: row.outputUrl,
    meta: row.outputMeta,
    creditsUsed: cost,
    remainingCredits: user.isUnlimited ? -1 : deduct.remaining,
  });
}
