import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const u = await getCurrentUser();
  if (!u) return NextResponse.json({ user: null }, { status: 200 });
  return NextResponse.json({
    user: {
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      credits: u.credits,
      isUnlimited: u.isUnlimited,
      plan: u.plan,
      avatarColor: u.avatarColor,
    },
  });
}
