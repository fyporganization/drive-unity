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
  '/.well-known/microsoft-identity-association.json'
];

const PUBLIC_API_ROUTES = [
  '/api/googleDrive/auth/status',
];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_ROUTES.includes(pathname)) {
    return true;
  }

  if (pathname.startsWith('/auth/')) {
    return true;
  }

  if (PUBLIC_API_ROUTES.some(route => pathname.startsWith(route))) {
    return true;
  }

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('/favicon') ||
    pathname.includes('.')
  ) {
    return true;
  }

  return false;
}

async function validateSession(request: NextRequest): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const TOKEN = process.env.TOKEN || 'USER_INFO';
    const cookie = cookieStore.get(TOKEN)?.value;

    if (!cookie) {
      return false;
    }

    try {
      let cleanCookie = cookie.trim();

      if (cleanCookie.charCodeAt(0) === 0xFEFF) {
        cleanCookie = cleanCookie.substring(1);
      }

      if (cleanCookie.startsWith('"') && cleanCookie.endsWith('"')) {
        cleanCookie = cleanCookie.slice(1, -1);
      }

      cleanCookie = cleanCookie.replace(/\\"/g, '"');

      const session = JSON.parse(cleanCookie);

      return !!(session && session.id && session.email);
    } catch {
      return false;
    }
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const hasValidSession = await validateSession(request);

  if (!hasValidSession) {
    const authUrl = new URL('/auth', request.url);
    authUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(authUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
