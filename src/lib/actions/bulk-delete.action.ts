'use server';

import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { buildDriveService } from '@/lib/google_client';
import { getValidGoogleDriveToken } from '@/lib/tokens/google';
import { getValidOneDriveToken } from '@/lib/tokens/onedrive';

export interface BulkDeleteParams {
  provider: 'google' | 'onedrive';
  /** Drive's own file IDs (the provider IDs, not our internal UUID PKs). */
  fileIds: string[];
}

export interface BulkDeleteResult {
  success: boolean;
  error?: string;
  deleted: { file_id: string; file_name: string; size_bytes: number }[];
  failed: { file_id: string; reason: string }[];
  bytes_freed: number;
}

/**
 * Deletes files from the provider (Google Drive / OneDrive) AND removes the
 * corresponding rows from our DB. Designed for the duplicate-cleanup flow but
 * usable for any bulk delete.
 *
 * Safety:
 *   - Session-authenticated; deletes only files owned by the current user
 *   - Per-file ownership check against DB before hitting provider API
 *   - Each file's API + DB delete wrapped in try/catch — one failure doesn't
 *     break the batch
 *   - Tokens refreshed per-account (1 refresh per unique account, not per file)
 */
export async function bulkDeleteFilesAction(
  params: BulkDeleteParams
): Promise<BulkDeleteResult> {
  const session = await getSession();
  if (!session?.id) {
    return { success: false, error: 'Unauthorized', deleted: [], failed: [], bytes_freed: 0 };
  }

  if (!Array.isArray(params.fileIds) || params.fileIds.length === 0) {
    return { success: false, error: 'fileIds is required', deleted: [], failed: [], bytes_freed: 0 };
  }

  const deleted: BulkDeleteResult['deleted'] = [];
  const failed: BulkDeleteResult['failed'] = [];

  if (params.provider === 'google') {
    await deleteGoogleFiles(session.id, params.fileIds, deleted, failed);
  } else if (params.provider === 'onedrive') {
    await deleteOneDriveFiles(session.id, params.fileIds, deleted, failed);
  } else {
    return { success: false, error: 'Invalid provider', deleted, failed, bytes_freed: 0 };
  }

  const bytes_freed = deleted.reduce((sum, d) => sum + d.size_bytes, 0);
  return { success: failed.length === 0, deleted, failed, bytes_freed };
}

async function deleteGoogleFiles(
  userId: string,
  fileIds: string[],
  deleted: BulkDeleteResult['deleted'],
  failed: BulkDeleteResult['failed']
): Promise<void> {
  const ownedFiles = await db.googleDriveFile.findMany({
    where: { userId, fileId: { in: fileIds } },
    select: {
      fileId: true,
      fileName: true,
      fileSize: true,
      googleDriveAccountId: true,
    },
  });

  for (const fileId of fileIds) {
    if (!ownedFiles.some((f) => f.fileId === fileId)) {
      failed.push({ file_id: fileId, reason: 'Not found or not owned by user' });
    }
  }

  // Group by account so we only refresh OAuth once per account.
  const byAccount = new Map<string, typeof ownedFiles>();
  for (const f of ownedFiles) {
    const arr = byAccount.get(f.googleDriveAccountId) ?? [];
    arr.push(f);
    byAccount.set(f.googleDriveAccountId, arr);
  }

  for (const [accountId, files] of byAccount) {
    let accessToken: string;
    try {
      accessToken = await getValidGoogleDriveToken(accountId);
    } catch (err) {
      const reason = err instanceof Error ? err.message : 'Token refresh failed';
      for (const f of files) failed.push({ file_id: f.fileId, reason });
      continue;
    }
    const drive = buildDriveService(accessToken);

    for (const f of files) {
      try {
        await drive.files.delete({ fileId: f.fileId });
        await db.googleDriveFile.delete({ where: { fileId: f.fileId } });
        deleted.push({
          file_id: f.fileId,
          file_name: f.fileName,
          size_bytes: f.fileSize ? Number(f.fileSize) : 0,
        });
      } catch (err) {
        const reason = err instanceof Error ? err.message : String(err);
        failed.push({ file_id: f.fileId, reason: reason.slice(0, 200) });
      }
    }
  }
}

async function deleteOneDriveFiles(
  userId: string,
  fileIds: string[],
  deleted: BulkDeleteResult['deleted'],
  failed: BulkDeleteResult['failed']
): Promise<void> {
  const ownedFiles = await db.oneDriveFile.findMany({
    where: { userId, fileId: { in: fileIds } },
    select: {
      fileId: true,
      fileName: true,
      fileSize: true,
      oneDriveAccountId: true,
    },
  });

  for (const fileId of fileIds) {
    if (!ownedFiles.some((f) => f.fileId === fileId)) {
      failed.push({ file_id: fileId, reason: 'Not found or not owned by user' });
    }
  }

  const byAccount = new Map<string, typeof ownedFiles>();
  for (const f of ownedFiles) {
    const arr = byAccount.get(f.oneDriveAccountId) ?? [];
    arr.push(f);
    byAccount.set(f.oneDriveAccountId, arr);
  }

  for (const [accountId, files] of byAccount) {
    let accessToken: string;
    try {
      accessToken = await getValidOneDriveToken(accountId);
    } catch (err) {
      const reason = err instanceof Error ? err.message : 'Token refresh failed';
      for (const f of files) failed.push({ file_id: f.fileId, reason });
      continue;
    }

    for (const f of files) {
      try {
        const resp = await fetch(
          `https://graph.microsoft.com/v1.0/me/drive/items/${f.fileId}`,
          { method: 'DELETE', headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (!resp.ok && resp.status !== 404) {
          throw new Error(`Graph API ${resp.status}: ${(await resp.text()).slice(0, 200)}`);
        }
        await db.oneDriveFile.delete({ where: { fileId: f.fileId } });
        deleted.push({
          file_id: f.fileId,
          file_name: f.fileName,
          size_bytes: f.fileSize ? Number(f.fileSize) : 0,
        });
      } catch (err) {
        const reason = err instanceof Error ? err.message : String(err);
        failed.push({ file_id: f.fileId, reason: reason.slice(0, 200) });
      }
    }
  }
}

/**
 * Convenience helper: deletes EVERY duplicate (keeps the original of each
 * group) for the current user. Internally calls `findDuplicatesAction` to
 * determine which IDs to delete, then `bulkDeleteFilesAction`.
 */
export async function deleteAllDuplicatesAction(
  provider: 'google' | 'onedrive',
  params: { driveId?: string | null } = {}
): Promise<BulkDeleteResult> {
  const session = await getSession();
  if (!session?.id) {
    return { success: false, error: 'Unauthorized', deleted: [], failed: [], bytes_freed: 0 };
  }

  const { findDuplicatesAction } = await import('./drive-filters.action');
  const duplicatesResult = await findDuplicatesAction(provider, {
    userId: session.id,
    driveId: params.driveId ?? null,
  });

  if (!duplicatesResult.success) {
    const message =
      'message' in duplicatesResult && typeof duplicatesResult.message === 'string'
        ? duplicatesResult.message
        : 'Failed to fetch duplicates';
    return { success: false, error: message, deleted: [], failed: [], bytes_freed: 0 };
  }

  const dupData = 'data' in duplicatesResult ? (duplicatesResult.data ?? []) : [];
  const ids: string[] = dupData.map((f: { fileId: string }) => f.fileId);
  if (ids.length === 0) {
    return { success: true, deleted: [], failed: [], bytes_freed: 0 };
  }

  return await bulkDeleteFilesAction({ provider, fileIds: ids });
}
