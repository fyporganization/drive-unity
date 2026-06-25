import { unstable_cache, revalidateTag } from 'next/cache';
import { Prisma } from '@/generated/prisma';
import { db } from '@/lib/db';

/**
 * Server-side caching helpers. Two layers:
 *
 *   - `cached(...)` wraps Next.js `unstable_cache` for Server Component data
 *     fetches (per-route, tag-revalidatable, edge-cached).
 *   - `cacheEntry*()` reads/writes the Postgres `cache_entries` table for
 *     ephemeral key/value caching across requests (e.g. search results,
 *     query embeddings). Single source of truth for the L3 layer.
 *
 * No code duplication: the search action's cache logic now uses these helpers.
 */

export interface CachedOptions {
  /** Cache lifetime in seconds. Defaults to 300 (5 min). */
  revalidate?: number;
  /** Tags for `revalidateTag()` calls — useful for invalidation on mutations. */
  tags?: string[];
  /** Key prefix to namespace cached entries (defaults to fn name). */
  prefix?: string;
}

/**
 * Wraps a server-side function with Next.js `unstable_cache`. Tagged variants
 * can be busted via `invalidateCache(tag)` when underlying data changes.
 *
 *   const getDriveFiles = cached(
 *     (userId: string, accountId: string) => db.googleDriveFile.findMany({...}),
 *     { tags: ['drive-files'], revalidate: 1800 }
 *   );
 */
export function cached<Args extends unknown[], Result>(
  fn: (...args: Args) => Promise<Result>,
  opts: CachedOptions = {}
): (...args: Args) => Promise<Result> {
  const prefix = opts.prefix ?? fn.name ?? 'cached';
  return unstable_cache(fn, [prefix], {
    revalidate: opts.revalidate ?? 300,
    tags: opts.tags ?? [],
  });
}

export function invalidateCache(tag: string): void {
  revalidateTag(tag);
}

// ─── Postgres CacheEntry layer (L3) ─────────────────────────────────────────

export async function cacheEntryRead<T>(key: string): Promise<T | null> {
  try {
    const row = await db.cacheEntry.findFirst({
      where: { key, expiresAt: { gt: new Date() } },
    });
    if (!row) return null;
    return row.value as unknown as T;
  } catch {
    return null;
  }
}

export async function cacheEntryWrite<T>(
  key: string,
  value: T,
  ttlMs: number
): Promise<void> {
  const expiresAt = new Date(Date.now() + ttlMs);
  try {
    await db.cacheEntry.upsert({
      where: { key },
      create: { key, value: value as unknown as Prisma.InputJsonValue, expiresAt },
      update: { value: value as unknown as Prisma.InputJsonValue, expiresAt },
    });
  } catch {
    // Cache write failures are non-fatal.
  }
}

export async function cacheEntryDelete(key: string): Promise<void> {
  try {
    await db.cacheEntry.delete({ where: { key } });
  } catch {
    // Missing key is fine.
  }
}

/**
 * Read-through helper. If the key is missing/expired, run `compute()`, write
 * the result, return it.
 */
export async function cacheEntryReadThrough<T>(
  key: string,
  ttlMs: number,
  compute: () => Promise<T>
): Promise<T> {
  const hit = await cacheEntryRead<T>(key);
  if (hit !== null) return hit;
  const fresh = await compute();
  await cacheEntryWrite(key, fresh, ttlMs);
  return fresh;
}
