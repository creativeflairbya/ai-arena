import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { generations } from "@/db/schema";
import { generateVideo, imageToVideoOutput, type Aspect, type Style } from "@/lib/generator";
import { costFor, safeDeduct } from "@/lib/credits";
import { z } from "zod";

const Body = z.object({
  prompt: z.string().min(1).max(2000),
  negative: z.string().max(500).optional(),
  aspect: z.enum(["16:9", "9:16", "1:1", "4:3"]).default("16:9"),
  style: z
    .enum(["cinematic", "neon", "anime", "realistic", "abstract", "vintage"])
    .default("cinematic"),
  durationSec: z.number().int().min(3).max(8).default(5),
  model: z.string().default("veo-2-pro"),
  sourceImage: z.string().optional(), // data URL for i2v
  kind: z.enum(["text_to_video", "image_to_video"]).default("text_to_video"),
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
  const {
    prompt,
    negative,
    aspect,
    style,
    durationSec,
    model,
    sourceImage,
    kind,
  } = parsed.data;

  const cost = costFor(kind);
  if (!user.isUnlimited && user.credits < cost) {
    return NextResponse.json(
      { error: `You need ${cost} credits for a video. Please top up or upgrade.` },
      { status: 402 },
    );
  }
  const deduct = await safeDeduct(user, cost);
  if (!deduct.ok) {
    return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
  }

  const out =
    kind === "image_to_video"
      ? imageToVideoOutput(
          sourceImage ? `image-driven: ${prompt}` : prompt,
          aspect as Aspect,
          style as Style,
          model,
        )
      : generateVideo({
          prompt,
          aspect: aspect as Aspect,
          style: style as Style,
          durationSec,
          model,
        });

  const [row] = await db
    .insert(generations)
    .values({
      userId: user.id,
      type: kind,
      model,
      prompt,
      negativePrompt: negative,
      inputImage: sourceImage,
      settings: { aspect, style, durationSec },
      status: "completed",
      outputUrl: `data:text/html;charset=utf-8,${encodeURIComponent(out.html)}`,
      outputMeta: {
        ...out.meta,
        width: out.width,
        height: out.height,
        durationSec: out.durationSec,
      },
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
