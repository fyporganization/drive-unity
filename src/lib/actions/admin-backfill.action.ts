'use server';

import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db';
import {
  triggerGoogleDriveBackfill,
  triggerOneDriveBackfill,
  type BackfillTriggerResult,
} from '@/lib/workflows/triggers';

export interface BackfillActionResult {
  success: boolean;
  error?: string;
  triggered: BackfillTriggerResult[];
  failed: { account_id: string; provider: 'google' | 'onedrive'; error: string }[];
}

async function requireAdmin(): Promise<{ ok: true; userId: string } | { ok: false; error: string }> {
  const session = await getSession();
  if (!session?.id) return { ok: false, error: 'Unauthorized' };
  const user = await db.user.findUnique({
    where: { id: session.id },
    select: { role: true },
  });
  if (user?.role !== 'ADMIN') return { ok: false, error: 'Admin role required' };
  return { ok: true, userId: session.id };
}

/**
 * Admin-only: trigger a full re-index (backfill) for a specific Google Drive
 * account or every Google account for a given user. Used after the migration
 * from MiniLM (384-dim, ChromaDB) to Gemini (768-dim, pgvector) since the old
 * embeddings are incompatible.
 */
export async function backfillGoogleDriveAccountsAction(params: {
  userId?: string;
  accountIds?: string[];
}): Promise<BackfillActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { success: false, error: auth.error, triggered: [], failed: [] };

  const accountIds = await resolveAccountIds(
    params.accountIds,
    params.userId
      ? db.googleDriveAccount.findMany({ where: { userId: params.userId }, select: { id: true } })
      : db.googleDriveAccount.findMany({ select: { id: true, userId: true } }),
    (a) => a.id
  );

  const accounts = await db.googleDriveAccount.findMany({
    where: { id: { in: accountIds } },
    select: { id: true, userId: true },
  });

  return await runBackfills(accounts, 'google', triggerGoogleDriveBackfill);
}

export async function backfillOneDriveAccountsAction(params: {
  userId?: string;
  accountIds?: string[];
}): Promise<BackfillActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { success: false, error: auth.error, triggered: [], failed: [] };

  const accountIds = await resolveAccountIds(
    params.accountIds,
    params.userId
      ? db.oneDriveAccount.findMany({ where: { userId: params.userId }, select: { id: true } })
      : db.oneDriveAccount.findMany({ select: { id: true, userId: true } }),
    (a) => a.id
  );

  const accounts = await db.oneDriveAccount.findMany({
    where: { id: { in: accountIds } },
    select: { id: true, userId: true },
  });

  return await runBackfills(accounts, 'onedrive', triggerOneDriveBackfill);
}

async function resolveAccountIds<T>(
  explicit: string[] | undefined,
  fallbackQuery: Promise<T[]>,
  pickId: (a: T) => string
): Promise<string[]> {
  if (explicit && explicit.length > 0) return explicit;
  const rows = await fallbackQuery;
  return rows.map(pickId);
}

async function runBackfills(
  accounts: { id: string; userId: string }[],
  provider: 'google' | 'onedrive',
  trigger: (userId: string, accountId: string) => Promise<BackfillTriggerResult>
): Promise<BackfillActionResult> {
  const triggered: BackfillTriggerResult[] = [];
  const failed: BackfillActionResult['failed'] = [];

  for (const account of accounts) {
    try {
      triggered.push(await trigger(account.userId, account.id));
    } catch (err) {
      failed.push({
        account_id: account.id,
        provider,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return { success: failed.length === 0, triggered, failed };
}
