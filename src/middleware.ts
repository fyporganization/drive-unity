import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/session';

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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) return NextResponse.next();

  const session = await getSession();
  if (session?.id) return NextResponse.next();

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
