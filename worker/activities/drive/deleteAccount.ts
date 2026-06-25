import { Context } from '@temporalio/activity';
import { Prisma } from '@/generated/prisma';
import { db } from '@/lib/db';

const BATCH_SIZE = 10_000;

export interface DeleteAccountInput {
  account_id: string;
}

export interface DeleteAccountResult {
  message: string;
  files_deleted: number;
  folders_deleted: number;
  chunks_deleted: number;
}

/**
 * Background-safe batched deletion of a Google Drive account's data.
 * Each batch runs in its own transaction so locks release between batches
 * and other queries (sync, search) stay unblocked.
 *
 * Order: chunks → files → folders → tree → account row.
 * Idempotent under Temporal retry — re-runs find 0 rows and exit cleanly.
 */
export async function deleteGoogleDriveAccountData(
  input: DeleteAccountInput
): Promise<DeleteAccountResult> {
  const ctx = Context.current();
  const { account_id: accountId } = input;

  ctx.heartbeat({ step: 'chunks' });
  const chunksDeleted = await batchedDelete(
    Prisma.sql`DELETE FROM file_chunks WHERE provider_type = 'google' AND account_id = ${accountId} AND id IN (
      SELECT id FROM file_chunks WHERE provider_type = 'google' AND account_id = ${accountId} LIMIT ${BATCH_SIZE}
    )`,
    (count) => ctx.heartbeat({ step: 'chunks', deleted: count })
  );

  ctx.heartbeat({ step: 'files' });
  const filesDeleted = await batchedDelete(
    Prisma.sql`DELETE FROM google_drive_files WHERE google_drive_account_id = ${accountId} AND id IN (
      SELECT id FROM google_drive_files WHERE google_drive_account_id = ${accountId} LIMIT ${BATCH_SIZE}
    )`,
    (count) => ctx.heartbeat({ step: 'files', deleted: count })
  );

  ctx.heartbeat({ step: 'folders' });
  const foldersDeleted = await batchedDelete(
    Prisma.sql`DELETE FROM google_drive_folders WHERE google_drive_account_id = ${accountId} AND id IN (
      SELECT id FROM google_drive_folders WHERE google_drive_account_id = ${accountId} LIMIT ${BATCH_SIZE}
    )`,
    (count) => ctx.heartbeat({ step: 'folders', deleted: count })
  );

  ctx.heartbeat({ step: 'tree' });
  await db.googleDriveFolderTree
    .delete({ where: { googleDriveAccountId: accountId } })
    .catch(() => undefined);

  ctx.heartbeat({ step: 'account' });
  await db.googleDriveAccount.delete({ where: { id: accountId } }).catch(() => undefined);

  return {
    message: 'Google Drive account deleted',
    files_deleted: filesDeleted,
    folders_deleted: foldersDeleted,
    chunks_deleted: chunksDeleted,
  };
}

export async function deleteOneDriveAccountData(
  input: DeleteAccountInput
): Promise<DeleteAccountResult> {
  const ctx = Context.current();
  const { account_id: accountId } = input;

  ctx.heartbeat({ step: 'chunks' });
  const chunksDeleted = await batchedDelete(
    Prisma.sql`DELETE FROM file_chunks WHERE provider_type = 'onedrive' AND account_id = ${accountId} AND id IN (
      SELECT id FROM file_chunks WHERE provider_type = 'onedrive' AND account_id = ${accountId} LIMIT ${BATCH_SIZE}
    )`,
    (count) => ctx.heartbeat({ step: 'chunks', deleted: count })
  );

  ctx.heartbeat({ step: 'files' });
  const filesDeleted = await batchedDelete(
    Prisma.sql`DELETE FROM one_drive_files WHERE one_drive_account_id = ${accountId} AND id IN (
      SELECT id FROM one_drive_files WHERE one_drive_account_id = ${accountId} LIMIT ${BATCH_SIZE}
    )`,
    (count) => ctx.heartbeat({ step: 'files', deleted: count })
  );

  ctx.heartbeat({ step: 'folders' });
  const foldersDeleted = await batchedDelete(
    Prisma.sql`DELETE FROM one_drive_folders WHERE one_drive_account_id = ${accountId} AND id IN (
      SELECT id FROM one_drive_folders WHERE one_drive_account_id = ${accountId} LIMIT ${BATCH_SIZE}
    )`,
    (count) => ctx.heartbeat({ step: 'folders', deleted: count })
  );

  ctx.heartbeat({ step: 'tree' });
  await db.oneDriveFolderTree
    .delete({ where: { oneDriveAccountId: accountId } })
    .catch(() => undefined);

  ctx.heartbeat({ step: 'account' });
  await db.oneDriveAccount.delete({ where: { id: accountId } }).catch(() => undefined);

  return {
    message: 'OneDrive account deleted',
    files_deleted: filesDeleted,
    folders_deleted: foldersDeleted,
    chunks_deleted: chunksDeleted,
  };
}

async function batchedDelete(
  query: Prisma.Sql,
  onProgress: (totalSoFar: number) => void
): Promise<number> {
  let total = 0;
  while (true) {
    const deleted = await db.$executeRaw(query);
    const n = Number(deleted);
    total += n;
    if (n === 0) break;
    onProgress(total);
  }
  return total;
}
