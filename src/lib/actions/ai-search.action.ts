'use server';

import { getSession } from '@/lib/auth/session';
import { performAISearch, type AISearchResponse } from '@/lib/search/ai-search';
import { db } from '@/lib/db';
import { enforceRateLimit, RateLimitExceededError } from '@/lib/rate-limit';

export interface AISearchActionParams {
  query: string;
  searchMode: 'images' | 'documents';
  accountIds?: string[];
  limit?: number;
}

/**
 * Server Action — replaces the Python proxy in /api/ai-search/route.ts.
 * Authenticates via cookie session, then hands off to `performAISearch` for
 * the actual pgvector query. Frontend uses TanStack `useMutation` to drive it.
 */
export async function aiSearchAction(params: AISearchActionParams): Promise<AISearchResponse> {
  const session = await getSession();
  if (!session?.id) {
    return {
      success: false,
      query: params.query,
      keywords: [],
      results_count: 0,
      results: [],
      error: 'Unauthorized',
    };
  }

  if (!params.query?.trim()) {
    return {
      success: false,
      query: '',
      keywords: [],
      results_count: 0,
      results: [],
      error: 'Query is required',
    };
  }

  let accountIds: string[] = Array.isArray(params.accountIds)
    ? params.accountIds.filter((id): id is string => typeof id === 'string' && id.length > 0)
    : [];

  if (accountIds.length === 0) {
    const accounts = await db.googleDriveAccount.findMany({
      where: { userId: session.id },
      select: { id: true },
    });
    if (accounts.length === 0) {
      return {
        success: false,
        query: params.query,
        keywords: [],
        results_count: 0,
        results: [],
        error: 'No connected Google Drive account found',
      };
    }
    accountIds = accounts.map((a) => a.id);
  }

  try {
    await enforceRateLimit(session.id, 'search');

    return await performAISearch({
      userId: session.id,
      query: params.query.trim(),
      searchMode: params.searchMode,
      accountIds,
      limit: params.limit,
    });
  } catch (err) {
    if (err instanceof RateLimitExceededError) {
      return {
        success: false,
        query: params.query,
        keywords: [],
        results_count: 0,
        results: [],
        error: `Rate limit exceeded — try again after ${err.result.reset_at.toISOString()}`,
      };
    }
    console.error('AI search action failed:', err);
    return {
      success: false,
      query: params.query,
      keywords: [],
      results_count: 0,
      results: [],
      error: err instanceof Error ? err.message : 'Search failed',
    };
  }
}
