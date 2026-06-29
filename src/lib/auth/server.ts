import { NextResponse } from 'next/server';
import { getSession } from './session';

export interface SessionData {
  id: string;
  name: string;
  email: string;
  role?: string;
  emailVerified?: Date | string;
}

/**
 * API-route auth guard. Returns the session if valid, otherwise a 401 JSON
 * NextResponse that the route can return directly.
 *
 *   export async function GET(req: NextRequest) {
 *     const auth = await requireAuth();
 *     if (auth instanceof NextResponse) return auth;
 *     // auth is now narrowed to SessionData — auth.id is trusted user
 *   }
 *
 * Always use `auth.id` over any query/body `userId` to prevent IDOR.
 */
export async function requireAuth(): Promise<SessionData | NextResponse> {
  const session = (await getSession()) as SessionData | null;
  if (!session?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return session;
}
