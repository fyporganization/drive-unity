import { Prisma } from '@/generated/prisma';
import { db } from '@/lib/db';
import { embedOne } from '@/lib/gemini';
import { sha256 } from '@/lib/hash';
import { cacheEntryRead, cacheEntryWrite } from '@/lib/cache';

export interface AISearchInput {
  userId: string;
  query: string;
  searchMode: 'images' | 'documents';
  accountIds?: string[];
  limit?: number;
}

export interface AISearchResult {
  id: string;
  name: string;
  mimeType: string;
  category: 'image' | 'document';
  relevance_score: number;
  distance: number;
  caption?: string;
  text_preview?: string;
  page_count?: number;
  extraction_method?: string;
  created_time: string;
  thumbnail?: string;
  web_view_link?: string;
  path: string;
  google_drive_account_id?: string;
}

export interface AISearchResponse {
  success: boolean;
  query: string;
  keywords: string[];
  results_count: number;
  results: AISearchResult[];
  cache_hit?: boolean;
  error?: string;
}

const IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
];

const CACHE_TTL_MS = 5 * 60 * 1000;
const DEFAULT_LIMIT = 20;

interface PgvectorRow {
  file_id: string;
  content: string;
  relevance_score: number;
  distance: number;
  file_name: string;
  mime_type: string;
  file_path: string;
  file_created_time: Date;
  thumbnail_link: string | null;
  web_view_link: string | null;
  google_drive_account_id: string;
}

/**
 * pgvector-backed semantic search across the user's indexed Google Drive
 * files. Replaces the Python `/api/image-search/*` proxy.
 *
 *   1. cache lookup (Postgres CacheEntry, 5 min TTL on userId + query + filters)
 *   2. embed query via Gemini text-embedding-004
 *   3. DISTINCT ON file_id pgvector cosine search — top scoring chunk per file
 *   4. MIME filter by searchMode (images vs documents)
 *   5. map to UI response shape
 *   6. cache write-through
 */
export async function performAISearch(input: AISearchInput): Promise<AISearchResponse> {
  const limit = Math.min(input.limit ?? DEFAULT_LIMIT, 50);
  const accountFilter = input.accountIds && input.accountIds.length > 0 ? input.accountIds : undefined;
  const cacheKey = buildCacheKey(input.userId, input.query, input.searchMode, accountFilter, limit);

  const cached = await cacheEntryRead<AISearchResponse>(cacheKey);
  if (cached) return { ...cached, cache_hit: true };

  const queryVector = await embedOne(input.query);
  const vectorLiteral = `[${queryVector.join(',')}]`;
  const mimeFilter = input.searchMode === 'images' ? IMAGE_MIME_TYPES : null;

  const rows: PgvectorRow[] = await db.$queryRaw(
    Prisma.sql`
      SELECT *
      FROM (
        SELECT DISTINCT ON (fc.file_id)
          fc.file_id,
          fc.content,
          1 - (ce.embedding <=> ${vectorLiteral}::vector) AS relevance_score,
          ce.embedding <=> ${vectorLiteral}::vector AS distance,
          f.file_name,
          f.mime_type,
          f.file_path,
          f.file_created_time,
          f.thumbnail_link,
          f.web_view_link,
          f.google_drive_account_id
        FROM file_chunks fc
        JOIN chunk_embeddings ce ON fc.embedding_id = ce.id
        JOIN google_drive_files f ON fc.file_id = f.file_id
        WHERE fc.user_id = ${input.userId}
          AND fc.provider_type = 'google'
          ${accountFilter ? Prisma.sql`AND fc.account_id IN (${Prisma.join(accountFilter)})` : Prisma.empty}
          ${mimeFilter
            ? Prisma.sql`AND f.mime_type IN (${Prisma.join(mimeFilter)})`
            : Prisma.sql`AND f.mime_type NOT IN (${Prisma.join(IMAGE_MIME_TYPES)})`}
        ORDER BY fc.file_id, ce.embedding <=> ${vectorLiteral}::vector ASC
      ) sub
      ORDER BY distance ASC
      LIMIT ${limit}
    `
  );

  const category: 'image' | 'document' = input.searchMode === 'images' ? 'image' : 'document';
  const results: AISearchResult[] = rows.map((r) => ({
    id: r.file_id,
    name: r.file_name,
    mimeType: r.mime_type,
    category,
    relevance_score: Number(r.relevance_score),
    distance: Number(r.distance),
    [category === 'image' ? 'caption' : 'text_preview']: truncate(r.content, 500),
    created_time: r.file_created_time.toISOString(),
    thumbnail: r.thumbnail_link ?? undefined,
    web_view_link: r.web_view_link ?? undefined,
    path: r.file_path,
    google_drive_account_id: r.google_drive_account_id,
  }));

  const response: AISearchResponse = {
    success: true,
    query: input.query,
    keywords: extractKeywords(input.query),
    results_count: results.length,
    results,
  };

  await cacheEntryWrite(cacheKey, response, CACHE_TTL_MS);
  return response;
}

function buildCacheKey(
  userId: string,
  query: string,
  searchMode: string,
  accountIds: string[] | undefined,
  limit: number
): string {
  const accountsKey = accountIds ? accountIds.slice().sort().join(',') : 'all';
  return `ai-search:${userId}:${sha256(`${query}|${searchMode}|${accountsKey}|${limit}`).slice(0, 32)}`;
}

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + '...' : text;
}

function extractKeywords(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);
}
