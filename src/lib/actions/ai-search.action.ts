'use server';

import { getSession } from '@/lib/auth/session';
import { performAISearch, type AISearchResponse } from '@/lib/search/ai-search';
import { db } from '@/lib/db';
import { enforceRateLimit, RateLimitExceededError } from '@/lib/rate-limit';

export interface AISearchActionParams {
  query: string;
  searchMode: 'images' | 'documents';
  limit?: number;
}

/**
 * Server Action — unified semantic search across the user's connected drives
 * (Google + OneDrive). Authenticates via cookie session, verifies the user
 * has at least one connected drive, then runs the pgvector query.
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

  const [googleCount, oneDriveCount] = await Promise.all([
    db.googleDriveAccount.count({ where: { userId: session.id } }),
    db.oneDriveAccount.count({ where: { userId: session.id } }),
  ]);

  if (googleCount + oneDriveCount === 0) {
    return {
      success: false,
      query: params.query,
      keywords: [],
      results_count: 0,
      results: [],
      error: 'No connected drive found — connect Google Drive or OneDrive first',
    };
  }

  try {
    await enforceRateLimit(session.id, 'search');

    return await performAISearch({
      userId: session.id,
      query: params.query.trim(),
      searchMode: params.searchMode,
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
