import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/session';
import { db } from '@/db';
import { users } from '@/db/schema';
import { hashPassword } from '@/lib/auth';
import { desc } from 'drizzle-orm';

export async function GET() {
  try {
    await requireAdmin();
    
    const allUsers = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        credits: users.credits,
        subscriptionTier: users.subscriptionTier,
        subscriptionStatus: users.subscriptionStatus,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt));

    return NextResponse.json({
      users: allUsers,
    });
  } catch (error: any) {
    console.error('Fetch users error:', error);
    
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
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

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();

    const { email, password, name, role, credits, subscriptionTier } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await db.insert(users).values({
      email,
      password: hashedPassword,
      name: name || null,
      role: role || 'user',
      credits: credits || 100,
      subscriptionTier: subscriptionTier || 'free',
      subscriptionStatus: 'active',
    }).returning();

    return NextResponse.json({
      user: {
        id: newUser[0].id,
        email: newUser[0].email,
        name: newUser[0].name,
        role: newUser[0].role,
        credits: newUser[0].credits,
        subscriptionTier: newUser[0].subscriptionTier,
      },
    });
  } catch (error: any) {
    console.error('Create user error:', error);
    
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
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
