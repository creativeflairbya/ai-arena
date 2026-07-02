import { cookies } from 'next/headers';
import { verifyToken, type SessionUser } from './auth';

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token');

  if (!token) {
    return null;
  }

  return verifyToken(token.value);
}

export async function requireAuth(): Promise<SessionUser> {
  const session = await getSession();
  
  if (!session) {
    throw new Error('Unauthorized');
  }

  return session;
}

export async function requireAdmin(): Promise<SessionUser> {
  const session = await requireAuth();
  
  if (session.role !== 'master' && session.role !== 'admin') {
    throw new Error('Forbidden');
  }

  return session;
}
