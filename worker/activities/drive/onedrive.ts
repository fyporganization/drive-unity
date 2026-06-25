import { Context } from '@temporalio/activity';
import { Prisma } from '@/generated/prisma';
import { db } from '@/lib/db';
import { getValidOneDriveToken } from '@/lib/tokens/onedrive';

const GRAPH_BASE = 'https://graph.microsoft.com/v1.0';

export interface OneDriveSyncInput {
  user_id: string;
  one_drive_account_id: string;
}

interface OneDriveItem {
  id: string;
  name: string;
  createdDateTime?: string;
  lastModifiedDateTime?: string;
  size?: number;
  webUrl?: string;
  parentReference?: { id?: string; path?: string };
  folder?: { childCount?: number };
  file?: { mimeType?: string; hashes?: { quickXorHash?: string; sha256Hash?: string } };
  '@microsoft.graph.downloadUrl'?: string;
}

interface DeltaResponse {
  value: OneDriveItem[];
  '@odata.nextLink'?: string;
  '@odata.deltaLink'?: string;
}

interface FolderRow {
  id: string;
  user_id: string;
  one_drive_account_id: string;
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
  one_drive_account_id: string;
  file_id: string;
  file_name: string;
  file_parents: string;
  file_created_time: Date;
  last_modified_time: Date | null;
  md5Checksum: string | null;
  mimeType: string;
  file_size: bigint | null;
  file_path: string;
  webViewLink: string | null;
}

/**
 * Port of Python `fetch_one_drive_metadata` activity.
 * OneDrive's /me/drive/root/delta returns folders + files in one paginated
 * stream. We separate them, resolve the folder tree, then bulk-upsert. The
 * final @odata.deltaLink is stored as a sync cursor for Phase 6.1.
 */
export async function fetchOneDriveMetadata(
  input: OneDriveSyncInput
): Promise<{ folders: number; files: number }> {
  const ctx = Context.current();
  const { user_id: userId, one_drive_account_id: accountId } = input;

  ctx.heartbeat({ msg: 'started' });

  const accessToken = await getValidOneDriveToken(accountId);

  // 1) Root metadata (for the tree root node)
  const root = await graphGet<{ id: string; name: string }>(
    `${GRAPH_BASE}/me/drive/root`,
    accessToken
  );

  const folders = new Map<string, FolderRow & { children: FolderTreeNode[] }>();
  folders.set(root.id, {
    id: root.id,
    user_id: userId,
    one_drive_account_id: accountId,
    folder_name: 'root',
    folder_parents: '',
    folder_path: 'root',
    children: [],
  });

  const folderTree: FolderTreeNode[] = [
    {
      id: root.id,
      text: 'My Files',
      state: { opened: true },
      children: folders.get(root.id)!.children,
    },
  ];

  // 2) Page through delta — gets every folder + file in the drive
  const allItems: OneDriveItem[] = [];
  let endpoint: string | undefined = `${GRAPH_BASE}/me/drive/root/delta`;
  let deltaLink: string | undefined;

  while (endpoint) {
    const data: DeltaResponse = await graphGet<DeltaResponse>(endpoint, accessToken);
    allItems.push(...(data.value ?? []));
    endpoint = data['@odata.nextLink'];
    deltaLink = data['@odata.deltaLink'] ?? deltaLink;
    ctx.heartbeat({ items: allItems.length });
  }

  // 3) Sort by createdDateTime so parents come before children when resolving the tree
  allItems.sort((a, b) =>
    (a.createdDateTime ?? '').localeCompare(b.createdDateTime ?? '')
  );

  // 4) Split into folders vs files
  const pendingFolders = new Map<string, OneDriveItem>();
  const fileItems: OneDriveItem[] = [];

  for (const item of allItems) {
    if (item.name === 'root') continue;
    if (item.folder) {
      pendingFolders.set(item.id, item);
    } else {
      fileItems.push(item);
    }
  }

  // 5) Iteratively resolve folder tree (same pattern as Google)
  const unresolved = new Map(pendingFolders);
  while (unresolved.size > 0) {
    let progress = false;

    for (const [fid, f] of Array.from(unresolved)) {
      const parentId = f.parentReference?.id;
      if (!parentId) {
        unresolved.delete(fid);
        continue;
      }

      const parent = folders.get(parentId);
      if (!parent) continue;

      const folderPath = `${parent.folder_path}/${f.name}`;
      const node: FolderRow & { children: FolderTreeNode[] } = {
        id: fid,
        user_id: userId,
        one_drive_account_id: accountId,
        folder_name: f.name,
        folder_parents: parentId,
        folder_path: folderPath,
        children: [],
      };
      folders.set(fid, node);
      parent.children.push({ id: fid, text: f.name, children: node.children });
      unresolved.delete(fid);
      progress = true;
    }

    if (!progress) break;
  }

  ctx.heartbeat({ msg: 'tree resolved', folders: folders.size });

  // 6) Bulk upsert folders (chunks of 1000)
  const flat: FolderRow[] = Array.from(folders.values()).map((f) => ({
    id: f.id,
    user_id: f.user_id,
    one_drive_account_id: f.one_drive_account_id,
    folder_name: f.folder_name,
    folder_parents: f.folder_parents,
    folder_path: f.folder_path,
  }));

  for (let i = 0; i < flat.length; i += 1000) {
    const slice = flat.slice(i, i + 1000);
    ctx.heartbeat({ msg: 'folder upsert', remaining: flat.length - i - slice.length });
    await upsertFolders(slice);
  }

  // 7) Upsert folder tree
  await db.oneDriveFolderTree.upsert({
    where: { oneDriveAccountId: accountId },
    create: {
      oneDriveAccountId: accountId,
      userId,
      folderTree: folderTree as unknown as Prisma.InputJsonValue,
    },
    update: {
      folderTree: folderTree as unknown as Prisma.InputJsonValue,
    },
  });

  // 8) Build + upsert file rows (skip orphans whose parent isn't in our folder map)
  const folderPathById = new Map(flat.map((f) => [f.id, f.folder_path]));
  const fileRows: FileRow[] = [];
  for (const f of fileItems) {
    const parentId = f.parentReference?.id;
    if (!parentId) continue;
    const folderPath = folderPathById.get(parentId);
    if (!folderPath) continue;
    if (!f.createdDateTime) continue;

    fileRows.push({
      user_id: userId,
      one_drive_account_id: accountId,
      file_id: f.id,
      file_name: f.name,
      file_parents: parentId,
      file_created_time: new Date(f.createdDateTime),
      last_modified_time: f.lastModifiedDateTime ? new Date(f.lastModifiedDateTime) : null,
      md5Checksum: f.file?.hashes?.quickXorHash ?? null,
      mimeType: f.file?.mimeType ?? 'application/octet-stream',
      file_size: typeof f.size === 'number' ? BigInt(f.size) : null,
      file_path: `${folderPath}/${f.name}`,
      webViewLink: f.webUrl ?? null,
    });
  }

  for (let i = 0; i < fileRows.length; i += 1000) {
    const slice = fileRows.slice(i, i + 1000);
    ctx.heartbeat({ msg: 'file upsert', remaining: fileRows.length - i - slice.length });
    await upsertFiles(slice);
  }

  // 9) Persist delta cursor for Phase 6.1 incremental sync
  if (deltaLink) {
    await db.oneDriveAccount.update({
      where: { id: accountId },
      data: { delta_link: deltaLink, lastSyncAt: new Date() },
    });
  } else {
    await db.oneDriveAccount.update({
      where: { id: accountId },
      data: { lastSyncAt: new Date() },
    });
  }

  ctx.heartbeat({ msg: 'completed' });
  return { folders: flat.length, files: fileRows.length };
}

// ─── helpers ────────────────────────────────────────────────────────────────

async function graphGet<T>(url: string, accessToken: string): Promise<T> {
  const resp = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`OneDrive Graph API ${resp.status} on ${url}: ${body.slice(0, 200)}`);
  }
  return (await resp.json()) as T;
}

async function upsertFolders(rows: FolderRow[]): Promise<void> {
  if (rows.length === 0) return;
  const values = Prisma.join(
    rows.map(
      (r) => Prisma.sql`(${r.id}, ${r.user_id}, ${r.one_drive_account_id}, ${r.folder_name}, ${r.folder_parents}, ${r.folder_path}, NOW(), NOW())`
    )
  );
  await db.$executeRaw(
    Prisma.sql`
      INSERT INTO one_drive_folders (id, user_id, one_drive_account_id, folder_name, folder_parents, folder_path, created_at, updated_at)
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
        ${r.one_drive_account_id},
        ${r.file_id},
        ${r.file_name},
        ${r.file_parents},
        ${r.file_created_time},
        ${r.last_modified_time},
        ${r.md5Checksum},
        ${r.mimeType},
        ${r.file_size},
        ${r.file_path},
        ${r.webViewLink},
        NOW(),
        NOW()
      )`
    )
  );
  await db.$executeRaw(
    Prisma.sql`
      INSERT INTO one_drive_files (
        id, user_id, one_drive_account_id, file_id, file_name, file_parents,
        file_created_time, last_modified_time, "md5Checksum", "mimeType",
        file_size, file_path, "webViewLink", created_at, updated_at
      )
      VALUES ${values}
      ON CONFLICT (file_id) DO UPDATE SET
        file_name = EXCLUDED.file_name,
        file_parents = EXCLUDED.file_parents,
        file_path = EXCLUDED.file_path,
        last_modified_time = EXCLUDED.last_modified_time,
        updated_at = NOW()
    `
  );
}
