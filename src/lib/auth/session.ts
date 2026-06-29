import { cookies } from 'next/headers';
import crypto from 'crypto';
import { db } from '@/lib/db';

export interface SessionPayload {
  id: string;
  name: string;
  email: string;
}

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const HMAC_NAMESPACE = 'session.v1';

function getSigningKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }
  return Buffer.from(key, 'hex');
}

function signPayload(payload: SessionPayload): string {
  const json = JSON.stringify(payload);
  const payloadB64 = Buffer.from(json, 'utf8').toString('base64url');
  const sig = crypto
    .createHmac('sha256', getSigningKey())
    .update(`${HMAC_NAMESPACE}.${payloadB64}`)
    .digest('base64url');
  return `${payloadB64}.${sig}`;
}

function verifyAndDecode(signed: string): SessionPayload | null {
  const dot = signed.indexOf('.');
  if (dot <= 0 || dot === signed.length - 1) return null;
  const payloadB64 = signed.slice(0, dot);
  const providedSig = signed.slice(dot + 1);

  const expectedSig = crypto
    .createHmac('sha256', getSigningKey())
    .update(`${HMAC_NAMESPACE}.${payloadB64}`)
    .digest('base64url');

  let providedBuf: Buffer;
  let expectedBuf: Buffer;
  try {
    providedBuf = Buffer.from(providedSig, 'base64url');
    expectedBuf = Buffer.from(expectedSig, 'base64url');
  } catch {
    return null;
  }
  if (providedBuf.length !== expectedBuf.length) return null;
  if (!crypto.timingSafeEqual(providedBuf, expectedBuf)) return null;

  try {
    const json = Buffer.from(payloadB64, 'base64url').toString('utf8');
    const data = JSON.parse(json) as Partial<SessionPayload>;
    if (typeof data.id !== 'string' || typeof data.email !== 'string') return null;
    return { id: data.id, name: data.name ?? '', email: data.email };
  } catch {
    return null;
  }
}

export async function createSession(userId: string) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const signed = signPayload({ id: user.id, name: user.name, email: user.email });

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

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const TOKEN = process.env.TOKEN || 'USER_INFO';
    const cookie = cookieStore.get(TOKEN)?.value;
    if (!cookie) return null;
    return verifyAndDecode(cookie);
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
