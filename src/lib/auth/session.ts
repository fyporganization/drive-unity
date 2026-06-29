import { cookies } from 'next/headers';
import { db } from '@/lib/db';

export async function createSession(userId: string) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const cookieData = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    const cookieValue = JSON.stringify(cookieData);

    const cookieStore = await cookies();
    const TOKEN = process.env.TOKEN || 'USER_INFO';

    cookieStore.set(TOKEN, cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });


    return { success: true };
  } catch (error) {
    console.error('Session creation error:', error);
    throw error;
  }
}

export async function getSession() {
  try {
    const cookieStore = await cookies();
    const TOKEN = process.env.TOKEN || 'USER_INFO';
    const cookie = cookieStore.get(TOKEN)?.value;

    if (!cookie) {
      return null;
    }

    let sessionData;
    try {
      let cleanCookie = decodeURIComponent(cookie);

      if (cleanCookie.charCodeAt(0) === 0xfeff) {
        cleanCookie = cleanCookie.substring(1);
      }

      if (cleanCookie.startsWith('"') && cleanCookie.endsWith('"')) {
        cleanCookie = cleanCookie.slice(1, -1);
      }

      cleanCookie = cleanCookie.replace(/\\"/g, '"');

      sessionData = JSON.parse(cleanCookie);
    } catch {
      return null;
    }
    return sessionData;
  } catch (error) {
    console.error('Get session error:', error);
    return null;
  }
}

export async function destroySession() {
  try {
    const cookieStore = await cookies();
    const TOKEN = process.env.TOKEN || 'USER_INFO';

    cookieStore.delete(TOKEN);

    return { success: true };
  } catch (error) {
    console.error('Session destruction error:', error);
    throw error;
  }
}