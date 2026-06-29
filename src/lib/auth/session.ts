import { cookies } from 'next/headers';

export interface SessionPayload {
  id: string;
  name: string;
  email: string;
}

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const HMAC_NAMESPACE = 'session.v1';

function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    out[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return out;
}

function base64urlEncode(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlEncodeStr(str: string): string {
  return base64urlEncode(new TextEncoder().encode(str));
}

function base64urlDecode(b64url: string): Uint8Array {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4 ? '='.repeat(4 - (b64.length % 4)) : '';
  const binary = atob(b64 + pad);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
  return arr;
}

async function getKey(): Promise<CryptoKey> {
  const keyHex = process.env.ENCRYPTION_KEY;
  if (!keyHex) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }
  return crypto.subtle.importKey(
    'raw',
    hexToBytes(keyHex) as BufferSource,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function signPayload(payload: SessionPayload): Promise<string> {
  const payloadB64 = base64urlEncodeStr(JSON.stringify(payload));
  const data = new TextEncoder().encode(`${HMAC_NAMESPACE}.${payloadB64}`);
  const key = await getKey();
  const sigBuf = await crypto.subtle.sign('HMAC', key, data);
  return `${payloadB64}.${base64urlEncode(new Uint8Array(sigBuf))}`;
}

async function verifyAndDecode(signed: string): Promise<SessionPayload | null> {
  const dot = signed.indexOf('.');
  if (dot <= 0 || dot === signed.length - 1) return null;
  const payloadB64 = signed.slice(0, dot);
  const providedSig = signed.slice(dot + 1);

  let sigBytes: Uint8Array;
  try {
    sigBytes = base64urlDecode(providedSig);
  } catch {
    return null;
  }
  const data = new TextEncoder().encode(`${HMAC_NAMESPACE}.${payloadB64}`);
  const key = await getKey();
  const ok = await crypto.subtle.verify('HMAC', key, sigBytes as BufferSource, data);
  if (!ok) return null;

  try {
    const json = new TextDecoder().decode(base64urlDecode(payloadB64));
    const data = JSON.parse(json) as Partial<SessionPayload>;
    if (typeof data.id !== 'string' || typeof data.email !== 'string') return null;
    return { id: data.id, name: data.name ?? '', email: data.email };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const TOKEN = process.env.TOKEN || 'USER_INFO';
    const cookie = cookieStore.get(TOKEN)?.value;
    if (!cookie) return null;
    return await verifyAndDecode(cookie);
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
