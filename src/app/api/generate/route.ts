import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import { db } from '@/db';
import { users, generations } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { generateWithReplicate, generateWithFallback, getCreditsRequired, type GenerationRequest } from '@/lib/ai-providers';

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();

    const { type, prompt, negativePrompt, settings, provider } = body;

    if (!type || !prompt) {
      return NextResponse.json(
        { error: 'Type and prompt are required' },
        { status: 400 }
      );
    }

    // Get user data
    const userData = await db.select().from(users).where(eq(users.id, session.id)).limit(1);
    
    if (userData.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = userData[0];
    const creditsRequired = getCreditsRequired(type, user.subscriptionTier || 'free');

    // Check credits (unless unlimited)
    if (user.subscriptionTier !== 'unlimited' && user.role !== 'master') {
      if (user.credits < creditsRequired) {
        return NextResponse.json(
          { error: 'Insufficient credits' },
          { status: 402 }
        );
      }
    }

    // Create generation record
    const newGeneration = await db.insert(generations).values({
      userId: session.id,
      type,
      provider: provider || 'replicate',
      prompt,
      negativePrompt: negativePrompt || null,
      settings: settings || null,
      status: 'processing',
      creditsUsed: creditsRequired,
    }).returning();

    const generation = newGeneration[0];

    // Process generation in background
    processGeneration(generation.id, {
      type,
      prompt,
      negativePrompt,
      settings,
    }, provider || 'replicate').catch(console.error);

    // Deduct credits immediately (unless unlimited)
    if (user.subscriptionTier !== 'unlimited' && user.role !== 'master') {
      await db.update(users)
        .set({ credits: user.credits - creditsRequired })
        .where(eq(users.id, session.id));
    }

    return NextResponse.json({
      generation: {
        id: generation.id,
        type: generation.type,
        status: generation.status,
        prompt: generation.prompt,
        creditsUsed: generation.creditsUsed,
      },
    });
  } catch (error: any) {
    console.error('Generation error:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function processGeneration(
  generationId: string,
  request: GenerationRequest,
  provider: string
) {
  try {
    let result;

    // Try with Replicate first, fallback to mock if no API key
    if (process.env.REPLICATE_API_TOKEN) {
      result = await generateWithReplicate(request);
    } else {
      result = await generateWithFallback(request);
    }

    if (result.success) {
      await db.update(generations)
        .set({
          status: 'completed',
          resultUrl: result.resultUrl,
          thumbnailUrl: result.thumbnailUrl || result.resultUrl,
          processingTime: result.processingTime,
          updatedAt: new Date(),
        })
        .where(eq(generations.id, generationId));
    } else {
      await db.update(generations)
        .set({
          status: 'failed',
          error: result.error,
          processingTime: result.processingTime,
          updatedAt: new Date(),
        })
        .where(eq(generations.id, generationId));
    }
  } catch (error: any) {
    console.error('Process generation error:', error);
    await db.update(generations)
      .set({
        status: 'failed',
        error: error.message || 'Unknown error',
        updatedAt: new Date(),
      })
      .where(eq(generations.id, generationId));
  }
}
