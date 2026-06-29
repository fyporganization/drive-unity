import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { signPayload, SESSION_MAX_AGE_SECONDS } from './session';

export async function createSession(userId: string) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const signed = await signPayload({ id: user.id, name: user.name, email: user.email });

    const cookieStore = await cookies();
    const TOKEN = process.env.TOKEN || 'USER_INFO';

    cookieStore.set(TOKEN, signed, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE_SECONDS,
      path: '/',
    });

    return { success: true };
  } catch (error) {
    console.error('Session creation error:', error);
    throw error;
  }
}
