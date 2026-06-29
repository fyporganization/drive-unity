import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

const PUBLIC_ROUTES = [
  '/home',
  '/about',
  '/price',
  '/contact',
  '/auth',
  '/terms',
  '/privacy',
  '/cookies',
  '/.well-known/microsoft-identity-association.json',
];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_ROUTES.includes(pathname)) return true;
  if (pathname.startsWith('/auth/')) return true;
  if (pathname === '/') return true;
  return false;
}

async function hasValidSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const TOKEN = process.env.TOKEN || 'USER_INFO';
  const cookie = cookieStore.get(TOKEN)?.value;
  if (!cookie) return false;

  try {
    let cleanCookie = cookie.trim();
    if (cleanCookie.charCodeAt(0) === 0xfeff) cleanCookie = cleanCookie.substring(1);
    if (cleanCookie.startsWith('"') && cleanCookie.endsWith('"')) {
      cleanCookie = cleanCookie.slice(1, -1);
    }
    cleanCookie = cleanCookie.replace(/\\"/g, '"');

    const session = JSON.parse(cleanCookie);
    return !!(session && session.id && session.email);
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) return NextResponse.next();

  if (await hasValidSession()) return NextResponse.next();

  const authUrl = new URL('/auth', request.url);
  authUrl.searchParams.set('redirect', pathname);
  return NextResponse.redirect(authUrl);
}

// Matcher excludes /api/* — API routes must enforce auth themselves and return
// JSON 401 rather than the HTML redirect this middleware produces. Static assets
// (_next, favicon, anything with a file extension) also skip.
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)'],
};
