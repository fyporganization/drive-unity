import { NextRequest, NextResponse } from 'next/server';
import { aiSearchAction } from '@/lib/actions/ai-search.action';

/**
 * Thin HTTP shim around the Server Action — kept for backwards compatibility
 * (external clients / mobile). The Server Action itself does auth + cache +
 * pgvector search via `performAISearch`. No more Python proxy.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const result = await aiSearchAction({
    query: body.query,
    searchMode: body.searchMode,
    limit: body.limit,
  });

  if (!result.success) {
    const status = result.error === 'Unauthorized' ? 401 : 400;
    return NextResponse.json(result, { status });
  }

  return NextResponse.json(result);
}
