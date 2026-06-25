import { ApplicationFailure, Context } from '@temporalio/activity';
import type { drive_v3 } from 'googleapis';
import { Prisma } from '@/generated/prisma';
import { db } from '@/lib/db';
import { buildDriveService } from '@/lib/google_client';
import { getValidGoogleDriveToken } from '@/lib/tokens/google';

export const INVALID_SYNC_TOKEN = 'InvalidSyncToken';

export interface DriveSyncInput {
  user_id: string;
  google_drive_account_id: string;
}

interface FolderRow {
  id: string;
  user_id: string;
  google_drive_account_id: string;
  folder_name: string;
  folder_parents: string;
  folder_path: string;
}

interface FolderTreeNode {
  id: string;
  text: string;
  state?: { opened: boolean };
  children: FolderTreeNode[];
}

interface FileRow {
  user_id: string;
  google_drive_account_id: string;
  file_id: string;
  file_name: string;
  file_parents: string;
  file_created_time: Date;
  md5Checksum: string | null;
  mime_type: string;
  file_size: bigint | null;
  viewed_by_me_time: Date | null;
  file_path: string;
  web_view_link: string | null;
  thumbnail_link: string | null;
}

export async function fetchDriveFolders(input: DriveSyncInput): Promise<number> {
  const ctx = Context.current();
  const { user_id: userId, google_drive_account_id: accountId } = input;

  ctx.heartbeat({ msg: 'activity started' });

  const accessToken = await getValidGoogleDriveToken(accountId);
  const drive = buildDriveService(accessToken);

  const rootResp = await drive.files.get({ fileId: 'root', fields: 'id,name' });
  const rootId = rootResp.data.id!;

  const folders = new Map<string, FolderRow & { children: FolderTreeNode[] }>();
  const folderTree: FolderTreeNode[] = [];

  folders.set(rootId, {
    id: rootId,
    user_id: userId,
    google_drive_account_id: accountId,
    folder_name: 'My Drive',
    folder_parents: '',
    folder_path: 'My Drive',
    children: [],
  });
  folderTree.push({
    id: rootId,
    text: 'My Drive',
    state: { opened: true },
    children: folders.get(rootId)!.children,
  });

  const rawFolders = new Map<string, { id: string; name: string; parents: string[] }>();
  let pageToken: string | undefined;

  ctx.heartbeat({ msg: 'starting folder listing' });

  do {
    const resp = await drive.files.list({
      q: "'me' in owners and mimeType='application/vnd.google-apps.folder' and trashed=false",
      fields: 'nextPageToken, files(id,name,parents)',
      orderBy: 'createdTime',
      pageSize: 1000,
      pageToken,
    });

    for (const f of resp.data.files ?? []) {
      if (!f.id || !f.name) continue;
      rawFolders.set(f.id, { id: f.id, name: f.name, parents: f.parents ?? [] });
    }

    pageToken = resp.data.nextPageToken ?? undefined;
    ctx.heartbeat({ msg: 'listing pages', received: rawFolders.size, page_token: pageToken });
  } while (pageToken);

  ctx.heartbeat({ msg: 'completed listing', total_raw: rawFolders.size });

  const pending = new Map(rawFolders);
  let loopCounter = 0;

  while (pending.size > 0) {
    let progress = false;

    for (const [folderId, folder] of Array.from(pending)) {
      const parents = folder.parents;
      if (parents.length === 0) {
        pending.delete(folderId);
        continue;
      }

      const parentId = parents[0];
      const parent = folders.get(parentId);
      if (!parent) continue;

      const folderPath = `${parent.folder_path}/${folder.name}`;
      const node: FolderRow & { children: FolderTreeNode[] } = {
        id: folderId,
        user_id: userId,
        google_drive_account_id: accountId,
        folder_name: folder.name,
        folder_parents: parentId,
        folder_path: folderPath,
        children: [],
      };
      folders.set(folderId, node);

      parent.children.push({ id: folderId, text: folder.name, children: node.children });
      pending.delete(folderId);
      progress = true;
    }

    loopCounter += 1;
    ctx.heartbeat({ msg: 'resolving tree', loop: loopCounter, pending: pending.size });
    if (!progress) break;
  }

  ctx.heartbeat({ msg: 'tree resolution completed', total_folders: folders.size });

  const flat: FolderRow[] = Array.from(folders.values()).map((f) => ({
    id: f.id,
    user_id: f.user_id,
    google_drive_account_id: f.google_drive_account_id,
    folder_name: f.folder_name,
    folder_parents: f.folder_parents,
    folder_path: f.folder_path,
  }));

  const CHUNK = 1000;
  const chunks = Math.ceil(flat.length / CHUNK);
  for (let i = 0; i < flat.length; i += CHUNK) {
    const slice = flat.slice(i, i + CHUNK);
    ctx.heartbeat({
      msg: 'db upsert',
      chunk: Math.floor(i / CHUNK) + 1,
      chunk_size: slice.length,
      remaining_chunks: chunks - Math.floor(i / CHUNK) - 1,
    });
    await upsertFolders(slice);
  }

  ctx.heartbeat({ msg: 'db: writing folder_tree' });
  await db.googleDriveFolderTree.upsert({
    where: { googleDriveAccountId: accountId },
    create: {
      googleDriveAccountId: accountId,
      userId,
      folderTree: folderTree as unknown as Prisma.InputJsonValue,
    },
    update: {
      folderTree: folderTree as unknown as Prisma.InputJsonValue,
    },
  });

  ctx.heartbeat({ msg: 'db completed' });
  return folders.size;
}

export async function getAllFilesFromFolders(input: DriveSyncInput): Promise<{ message: string; total: number }> {
  const ctx = Context.current();
  const { user_id: userId, google_drive_account_id: accountId } = input;

  ctx.heartbeat({ step: 'init' });

  const folders = await db.googleDriveFolder.findMany({
    where: { userId, googleDriveAccountId: accountId },
    select: { id: true, folderPath: true },
  });
  const folderPathById = new Map(folders.map((f) => [f.id, f.folderPath]));

  const accessToken = await getValidGoogleDriveToken(accountId);
  const drive = buildDriveService(accessToken);

  let pageToken: string | undefined;
  let total = 0;
  // 1-deep pipeline: previous page's DB write runs in the background while we
  // fetch the next page from Drive. We await it before kicking off a new one
  // (fail-fast on DB errors, bounded memory, single active write at a time).
  let pendingWrite: Promise<void> = Promise.resolve();

  do {
    const resp = await drive.files.list({
      q: "'me' in owners and mimeType!='application/vnd.google-apps.folder' and trashed=false",
      fields:
        'nextPageToken, files(id, name, parents, mimeType, createdTime, md5Checksum, size, viewedByMeTime, webViewLink, thumbnailLink)',
      orderBy: 'createdTime',
      pageToken,
      pageSize: 1000,
    });

    const batch: FileRow[] = [];
    for (const f of resp.data.files ?? []) {
      if (!f.id || !f.name || !f.mimeType || !f.createdTime) continue;
      const parents = f.parents ?? [];
      if (parents.length === 0) continue;
      const parentId = parents[0];
      const folderPath = folderPathById.get(parentId);
      if (!folderPath) continue;

      batch.push({
        user_id: userId,
        google_drive_account_id: accountId,
        file_id: f.id,
        file_name: f.name,
        file_parents: parentId,
        file_created_time: new Date(f.createdTime),
        md5Checksum: f.md5Checksum ?? null,
        mime_type: f.mimeType,
        file_size: f.size ? BigInt(f.size) : null,
        viewed_by_me_time: f.viewedByMeTime ? new Date(f.viewedByMeTime) : null,
        file_path: `${folderPath}/${f.name}`,
        web_view_link: f.webViewLink ?? null,
        thumbnail_link: f.thumbnailLink ?? null,
      });
    }

    pageToken = resp.data.nextPageToken ?? undefined;
    ctx.heartbeat({ page_token: pageToken, count: batch.length });

    await pendingWrite;
    if (batch.length > 0) {
      pendingWrite = upsertFiles(batch);
      total += batch.length;
      ctx.heartbeat({ step: 'queued', count: batch.length, total });
    }
  } while (pageToken);

  await pendingWrite;

  const cursor = await drive.changes.getStartPageToken();
  await db.googleDriveAccount.update({
    where: { id: accountId },
    data: {
      startPageToken: cursor.data.startPageToken ?? null,
      lastSyncAt: new Date(),
    },
  });

  return { message: 'All Done', total };
}

async function upsertFolders(rows: FolderRow[]): Promise<void> {
  if (rows.length === 0) return;
  const values = Prisma.join(
    rows.map(
      (r) => Prisma.sql`(${r.id}, ${r.user_id}, ${r.google_drive_account_id}, ${r.folder_name}, ${r.folder_parents}, ${r.folder_path}, NOW(), NOW())`
    )
  );
  await db.$executeRaw(
    Prisma.sql`
      INSERT INTO google_drive_folders (id, user_id, google_drive_account_id, folder_name, folder_parents, folder_path, created_at, updated_at)
      VALUES ${values}
      ON CONFLICT (id) DO UPDATE SET
        folder_name = EXCLUDED.folder_name,
        folder_parents = EXCLUDED.folder_parents,
        folder_path = EXCLUDED.folder_path,
        updated_at = NOW()
    `
  );
}

async function upsertFiles(rows: FileRow[]): Promise<void> {
  if (rows.length === 0) return;
  const values = Prisma.join(
    rows.map(
      (r) => Prisma.sql`(
        gen_random_uuid()::text,
        ${r.user_id},
        ${r.google_drive_account_id},
        ${r.file_id},
        ${r.file_name},
        ${r.file_parents},
        ${r.file_created_time},
        ${r.md5Checksum},
        ${r.mime_type},
        ${r.file_size},
        ${r.viewed_by_me_time},
        ${r.file_path},
        ${r.web_view_link},
        ${r.thumbnail_link},
        NOW(),
        NOW()
      )`
    )
  );
  await db.$executeRaw(
    Prisma.sql`
      INSERT INTO google_drive_files (
        id, user_id, google_drive_account_id, file_id, file_name, file_parents,
        file_created_time, "md5Checksum", mime_type, file_size, viewed_by_me_time,
        file_path, web_view_link, thumbnail_link, created_at, updated_at
      )
      VALUES ${values}
      ON CONFLICT (file_id) DO UPDATE SET
        file_name = EXCLUDED.file_name,
        file_parents = EXCLUDED.file_parents,
        viewed_by_me_time = EXCLUDED.viewed_by_me_time,
        file_path = EXCLUDED.file_path,
        "md5Checksum" = EXCLUDED."md5Checksum",
        mime_type = EXCLUDED.mime_type,
        file_size = EXCLUDED.file_size,
        web_view_link = EXCLUDED.web_view_link,
        thumbnail_link = EXCLUDED.thumbnail_link,
        updated_at = NOW()
    `
  );
}

export interface SyncDriveChangesResult {
  message: string;
  changed_files: number;
  deleted_files: number;
  changed_folders: number;
  deleted_folders: number;
}

/**
 * Incremental sync via Drive Changes API. Reads the saved startPageToken,
 * pulls only what changed since the last sync (creates/edits/renames/deletes
 * for both files and folders), applies path-prefix cascade when a folder is
 * renamed or moved, and persists the new cursor.
 *
 * Throws ApplicationFailure(type=InvalidSyncToken, nonRetryable) when the
 * cursor is missing or rejected by Drive (HTTP 410). The workflow catches
 * this and falls back to a full sync.
 */
export async function syncDriveChanges(input: DriveSyncInput): Promise<SyncDriveChangesResult> {
  const ctx = Context.current();
  const { user_id: userId, google_drive_account_id: accountId } = input;

  const account = await db.googleDriveAccount.findUnique({
    where: { id: accountId },
    select: { startPageToken: true },
  });
  if (!account?.startPageToken) {
    throw ApplicationFailure.create({
      message: 'no startPageToken saved — full sync required',
      type: INVALID_SYNC_TOKEN,
      nonRetryable: true,
    });
  }

  const accessToken = await getValidGoogleDriveToken(accountId);
  const drive = buildDriveService(accessToken);

  let pageToken: string | undefined = account.startPageToken;
  let newStartPageToken: string | undefined;
  let changedFiles = 0;
  let deletedFiles = 0;
  let changedFolders = 0;
  let deletedFolders = 0;

  ctx.heartbeat({ step: 'init', pageToken });

  do {
    let resp;
    try {
      resp = await drive.changes.list({
        pageToken,
        pageSize: 1000,
        fields:
          'nextPageToken, newStartPageToken, changes(fileId, removed, file(id, name, mimeType, parents, trashed, createdTime, md5Checksum, size, viewedByMeTime, webViewLink, thumbnailLink))',
      });
    } catch (err) {
      const status =
        (err as { code?: number; response?: { status?: number } }).code ??
        (err as { response?: { status?: number } }).response?.status;
      if (status === 410) {
        await db.googleDriveAccount.update({
          where: { id: accountId },
          data: { startPageToken: null },
        });
        throw ApplicationFailure.create({
          message: '410 Gone — startPageToken expired, full sync required',
          type: INVALID_SYNC_TOKEN,
          nonRetryable: true,
        });
      }
      throw err;
    }

    for (const change of resp.data.changes ?? []) {
      if (!change.fileId) continue;

      if (change.removed || change.file?.trashed) {
        const kind = await deleteByFileIdGoogle(accountId, change.fileId);
        if (kind === 'folder') deletedFolders += 1;
        else if (kind === 'file') deletedFiles += 1;
        continue;
      }

      const f = change.file;
      if (!f || !f.id || !f.name || !f.mimeType) continue;

      if (f.mimeType === 'application/vnd.google-apps.folder') {
        const applied = await upsertFolderIncremental(accountId, userId, f);
        if (applied) changedFolders += 1;
      } else {
        const applied = await upsertFileIncremental(accountId, userId, f);
        if (applied) changedFiles += 1;
      }
    }

    pageToken = resp.data.nextPageToken ?? undefined;
    if (resp.data.newStartPageToken) {
      newStartPageToken = resp.data.newStartPageToken;
    }
    ctx.heartbeat({
      step: 'page',
      pageToken,
      changedFiles,
      deletedFiles,
      changedFolders,
      deletedFolders,
    });
  } while (pageToken);

  if (newStartPageToken) {
    await db.googleDriveAccount.update({
      where: { id: accountId },
      data: { startPageToken: newStartPageToken, lastSyncAt: new Date() },
    });
  } else {
    await db.googleDriveAccount.update({
      where: { id: accountId },
      data: { lastSyncAt: new Date() },
    });
  }

  return {
    message: 'Incremental sync complete',
    changed_files: changedFiles,
    deleted_files: deletedFiles,
    changed_folders: changedFolders,
    deleted_folders: deletedFolders,
  };
}

// ─── incremental helpers ────────────────────────────────────────────────────

type GoogleChangeFile = drive_v3.Schema$File;

async function deleteByFileIdGoogle(
  accountId: string,
  fileId: string
): Promise<'folder' | 'file' | 'none'> {
  const folder = await db.googleDriveFolder.findFirst({
    where: { id: fileId, googleDriveAccountId: accountId },
    select: { id: true, folderPath: true },
  });
  if (folder) {
    const descendantPrefix = likeEscape(folder.folderPath) + '/%';
    // Strip chunks for the folder's own files + any descendant files (no FK on file_chunks.file_id).
    await db.$executeRaw(Prisma.sql`
      DELETE FROM file_chunks
      WHERE provider_type = 'google'
        AND file_id IN (
          SELECT file_id FROM google_drive_files
          WHERE google_drive_account_id = ${accountId}
            AND (file_parents = ${folder.id} OR file_path LIKE ${descendantPrefix} ESCAPE E'\\')
        )
    `);
    // Delete descendant folders (the FK on google_drive_files.file_parents cascades the contained files).
    await db.$executeRaw(Prisma.sql`
      DELETE FROM google_drive_folders
      WHERE google_drive_account_id = ${accountId}
        AND folder_path LIKE ${descendantPrefix} ESCAPE E'\\'
    `);
    // Finally the folder itself — cascades its direct files.
    await db.googleDriveFolder.delete({ where: { id: folder.id } });
    return 'folder';
  }

  const file = await db.googleDriveFile.findUnique({
    where: { fileId },
    select: { fileId: true },
  });
  if (file) {
    await db.$executeRaw(Prisma.sql`
      DELETE FROM file_chunks WHERE provider_type = 'google' AND file_id = ${fileId}
    `);
    await db.googleDriveFile.delete({ where: { fileId } });
    return 'file';
  }

  return 'none';
}

async function upsertFolderIncremental(
  accountId: string,
  userId: string,
  f: GoogleChangeFile
): Promise<boolean> {
  if (!f.id || !f.name) return false;
  const parents = f.parents ?? [];
  if (parents.length === 0) return false;
  const parentId = parents[0];

  const parent = await db.googleDriveFolder.findFirst({
    where: { id: parentId, googleDriveAccountId: accountId },
    select: { folderPath: true },
  });
  if (!parent) return false; // orphan — parent not synced yet, skip

  const newPath = `${parent.folderPath}/${f.name}`;

  const existing = await db.googleDriveFolder.findFirst({
    where: { id: f.id, googleDriveAccountId: accountId },
    select: { folderPath: true, folderName: true, folderParents: true },
  });

  if (!existing) {
    await db.googleDriveFolder.create({
      data: {
        id: f.id,
        userId,
        googleDriveAccountId: accountId,
        folderName: f.name,
        folderParents: parentId,
        folderPath: newPath,
      },
    });
    return true;
  }

  if (
    existing.folderPath === newPath &&
    existing.folderName === f.name &&
    existing.folderParents === parentId
  ) {
    return false; // no-op
  }

  if (existing.folderPath !== newPath) {
    const oldPrefixLike = likeEscape(existing.folderPath) + '/%';
    const oldLen = existing.folderPath.length;
    // Cascade descendant folder paths.
    await db.$executeRaw(Prisma.sql`
      UPDATE google_drive_folders
      SET folder_path = ${newPath} || SUBSTRING(folder_path FROM ${oldLen + 1}),
          updated_at = NOW()
      WHERE google_drive_account_id = ${accountId}
        AND folder_path LIKE ${oldPrefixLike} ESCAPE E'\\'
    `);
    // Cascade descendant file paths.
    await db.$executeRaw(Prisma.sql`
      UPDATE google_drive_files
      SET file_path = ${newPath} || SUBSTRING(file_path FROM ${oldLen + 1}),
          updated_at = NOW()
      WHERE google_drive_account_id = ${accountId}
        AND file_path LIKE ${oldPrefixLike} ESCAPE E'\\'
    `);
  }

  await db.googleDriveFolder.update({
    where: { id: f.id },
    data: {
      folderName: f.name,
      folderParents: parentId,
      folderPath: newPath,
    },
  });
  return true;
}

async function upsertFileIncremental(
  accountId: string,
  userId: string,
  f: GoogleChangeFile
): Promise<boolean> {
  if (!f.id || !f.name || !f.mimeType || !f.createdTime) return false;
  const parents = f.parents ?? [];
  if (parents.length === 0) return false;
  const parentId = parents[0];

  const parent = await db.googleDriveFolder.findFirst({
    where: { id: parentId, googleDriveAccountId: accountId },
    select: { folderPath: true },
  });
  if (!parent) return false;

  await upsertFiles([
    {
      user_id: userId,
      google_drive_account_id: accountId,
      file_id: f.id,
      file_name: f.name,
      file_parents: parentId,
      file_created_time: new Date(f.createdTime),
      md5Checksum: f.md5Checksum ?? null,
      mime_type: f.mimeType,
      file_size: f.size ? BigInt(f.size) : null,
      viewed_by_me_time: f.viewedByMeTime ? new Date(f.viewedByMeTime) : null,
      file_path: `${parent.folderPath}/${f.name}`,
      web_view_link: f.webViewLink ?? null,
      thumbnail_link: f.thumbnailLink ?? null,
    },
  ]);
  return true;
}

function likeEscape(s: string): string {
  return s.replace(/[\\%_]/g, '\\$&');
}
