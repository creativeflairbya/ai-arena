import { NextResponse } from "next/server";
import { clearSessionCookie, destroySession, getSessionPayload } from "@/lib/auth";

export async function POST() {
  const payload = await getSessionPayload();
  if (payload) {
    await destroySession(payload.sessionId);
  }
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
