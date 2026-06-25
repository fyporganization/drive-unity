import { Context } from '@temporalio/activity';
import { db } from '@/lib/db';
import { getValidGoogleDriveToken } from '@/lib/tokens/google';
import { getValidOneDriveToken } from '@/lib/tokens/onedrive';
import { triggerGoogleDriveSync, triggerOneDriveSync } from '@/lib/workflows/triggers';

const DELTA_SYNC_LOOKBACK_MIN = 15;

export interface TokenRefreshResult {
  google: { refreshed: number; failed: number };
  onedrive: { refreshed: number; failed: number };
}

/**
 * Hourly schedule. Walks every Drive account and calls the existing
 * `getValidXxxDriveToken` helper — which auto-refreshes any token expiring
 * inside the 5-minute buffer. Failures here mean OAuth has been revoked or
 * the provider rejected the refresh — surface for admin attention.
 */
export async function refreshAllDriveTokens(): Promise<TokenRefreshResult> {
  const ctx = Context.current();
  ctx.heartbeat({ step: 'init' });

  const googleAccounts = await db.googleDriveAccount.findMany({ select: { id: true } });
  let googleRefreshed = 0;
  let googleFailed = 0;
  for (const acc of googleAccounts) {
    try {
      await getValidGoogleDriveToken(acc.id);
      googleRefreshed++;
    } catch (err) {
      googleFailed++;
      console.error(`Google refresh failed for account ${acc.id}:`, err);
    }
    ctx.heartbeat({ provider: 'google', refreshed: googleRefreshed, failed: googleFailed });
  }

  const oneDriveAccounts = await db.oneDriveAccount.findMany({ select: { id: true } });
  let oneDriveRefreshed = 0;
  let oneDriveFailed = 0;
  for (const acc of oneDriveAccounts) {
    try {
      await getValidOneDriveToken(acc.id);
      oneDriveRefreshed++;
    } catch (err) {
      oneDriveFailed++;
      console.error(`OneDrive refresh failed for account ${acc.id}:`, err);
    }
    ctx.heartbeat({ provider: 'onedrive', refreshed: oneDriveRefreshed, failed: oneDriveFailed });
  }

  return {
    google: { refreshed: googleRefreshed, failed: googleFailed },
    onedrive: { refreshed: oneDriveRefreshed, failed: oneDriveFailed },
  };
}

export interface DeltaSyncResult {
  google_triggered: number;
  onedrive_triggered: number;
  failures: { account_id: string; error: string }[];
}

/**
 * Every-15-min schedule. Triggers the per-account metadata workflow for any
 * account whose `last_sync_at` is older than the lookback window. The workflow
 * itself filters files by `indexStatus` — already-indexed files are skipped
 * cheaply (no Gemini cost), so re-running is safe + idempotent.
 */
export async function triggerAllDeltaSyncs(): Promise<DeltaSyncResult> {
  const ctx = Context.current();
  const cutoff = new Date(Date.now() - DELTA_SYNC_LOOKBACK_MIN * 60 * 1000);
  const failures: DeltaSyncResult['failures'] = [];

  const googleAccounts = await db.googleDriveAccount.findMany({
    where: { OR: [{ lastSyncAt: null }, { lastSyncAt: { lt: cutoff } }] },
    select: { id: true, userId: true },
  });
  let googleTriggered = 0;
  for (const acc of googleAccounts) {
    try {
      await triggerGoogleDriveSync(acc.userId, acc.id);
      googleTriggered++;
    } catch (err) {
      failures.push({ account_id: acc.id, error: err instanceof Error ? err.message : String(err) });
    }
    ctx.heartbeat({ provider: 'google', triggered: googleTriggered });
  }

  const oneDriveAccounts = await db.oneDriveAccount.findMany({
    where: { OR: [{ lastSyncAt: null }, { lastSyncAt: { lt: cutoff } }] },
    select: { id: true, userId: true },
  });
  let oneDriveTriggered = 0;
  for (const acc of oneDriveAccounts) {
    try {
      await triggerOneDriveSync(acc.userId, acc.id);
      oneDriveTriggered++;
    } catch (err) {
      failures.push({ account_id: acc.id, error: err instanceof Error ? err.message : String(err) });
    }
    ctx.heartbeat({ provider: 'onedrive', triggered: oneDriveTriggered });
  }

  return { google_triggered: googleTriggered, onedrive_triggered: oneDriveTriggered, failures };
}

export interface CleanupResult {
  expired_cache_entries: number;
  expired_rate_limits: number;
  orphan_embeddings: number;
}

/**
 * Daily schedule. Three sweeps:
 *   1. Expired CacheEntry rows (TTL passed) — search-result cache GC
 *   2. RateLimit counters older than 1 hour — sliding-window GC
 *   3. ChunkEmbedding rows no longer referenced by any FileChunk — orphan GC
 *      (left behind when files are deleted or re-indexed with different
 *      content). Safe because FK is ON DELETE RESTRICT — embeddings only
 *      become orphans after all their chunks are deleted.
 */
export async function runDailyCleanup(): Promise<CleanupResult> {
  const ctx = Context.current();
  ctx.heartbeat({ step: 'init' });

  const expiredCache = await db.cacheEntry.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
  ctx.heartbeat({ step: 'cache_done', removed: expiredCache.count });

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const expiredRateLimits = await db.rateLimit.deleteMany({
    where: { windowAt: { lt: oneHourAgo } },
  });
  ctx.heartbeat({ step: 'rate_limit_done', removed: expiredRateLimits.count });

  const orphanCount = await db.$executeRaw`
    DELETE FROM chunk_embeddings
    WHERE id NOT IN (SELECT DISTINCT embedding_id FROM file_chunks WHERE embedding_id IS NOT NULL)
  `;
  ctx.heartbeat({ step: 'orphan_done', removed: Number(orphanCount) });

  return {
    expired_cache_entries: expiredCache.count,
    expired_rate_limits: expiredRateLimits.count,
    orphan_embeddings: Number(orphanCount),
  };
}
