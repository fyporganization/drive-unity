import { Context } from '@temporalio/activity';
import { db } from '@/lib/db';
import { getValidOneDriveToken } from '@/lib/tokens/onedrive';
import { chunkText } from '@/lib/chunking';
import { sha256 } from '@/lib/hash';
import { extractDocumentText } from '../extract/document';
import { embedAndUpsertChunks } from '../embed/chunks';

const GRAPH_BASE = 'https://graph.microsoft.com/v1.0';

const DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-powerpoint',
  'text/plain',
];

const MIN_TEXT_LENGTH = 50;
const MAX_FILE_BYTES = 10 * 1024 * 1024;

export interface OneDriveDocumentRAGInput {
  user_id: string;
  one_drive_account_id: string;
}

export interface OneDriveDocumentRAGResult {
  message: string;
  total_documents: number;
  indexed: number;
  reused: number;
  skipped: number;
  failed: number;
}

export async function indexDocumentsForOneDriveAccount(
  input: OneDriveDocumentRAGInput
): Promise<OneDriveDocumentRAGResult> {
  const ctx = Context.current();
  const { user_id: userId, one_drive_account_id: accountId } = input;

  ctx.heartbeat({ step: 'init' });

  const candidates = await db.oneDriveFile.findMany({
    where: {
      userId,
      oneDriveAccountId: accountId,
      mimeType: { in: DOCUMENT_MIME_TYPES },
      OR: [{ indexStatus: 'PENDING' }, { indexStatus: 'FAILED' }],
    },
    select: {
      fileId: true,
      fileName: true,
      mimeType: true,
      fileSize: true,
      contentHash: true,
    },
  });

  const total = candidates.length;
  ctx.heartbeat({ step: 'candidates_loaded', total });

  if (total === 0) {
    return { message: 'No documents to index', total_documents: 0, indexed: 0, reused: 0, skipped: 0, failed: 0 };
  }

  let indexed = 0;
  let reused = 0;
  let skipped = 0;
  let failed = 0;

  for (const file of candidates) {
    ctx.heartbeat({
      step: 'processing',
      file_name: file.fileName,
      progress: `${indexed + reused + skipped + failed}/${total}`,
    });

    if (file.fileSize && Number(file.fileSize) > MAX_FILE_BYTES) {
      await markStatus(file.fileId, 'SKIPPED', null, `File too large: ${file.fileSize} bytes`);
      skipped++;
      continue;
    }

    try {
      await markStatus(file.fileId, 'INDEXING', null, null);

      const accessToken = await getValidOneDriveToken(accountId);
      const buffer = await downloadOneDriveFile(accessToken, file.fileId);
      const contentHash = sha256(buffer);

      if (file.contentHash === contentHash) {
        await markStatus(file.fileId, 'INDEXED', contentHash, null);
        reused++;
        continue;
      }

      ctx.heartbeat({ step: 'extracting', file_name: file.fileName });
      const { text, metadata } = await extractDocumentText(buffer, file.mimeType, file.fileName);

      if (metadata.method === 'unsupported') {
        await markStatus(file.fileId, 'SKIPPED', contentHash, `Unsupported MIME: ${file.mimeType}`);
        skipped++;
        continue;
      }

      if (!text || text.trim().length < MIN_TEXT_LENGTH) {
        await markStatus(file.fileId, 'SKIPPED', contentHash, `Text too short (${text?.length ?? 0} chars)`);
        skipped++;
        continue;
      }

      const chunks = chunkText(text);
      ctx.heartbeat({ step: 'embedding', file_name: file.fileName, chunk_count: chunks.length });

      const heartbeatTimer = setInterval(() => {
        ctx.heartbeat({ step: 'embedding_pending', file_name: file.fileName });
      }, 30_000);
      let embedResult;
      try {
        embedResult = await embedAndUpsertChunks(
          {
            user_id: userId,
            provider_type: 'onedrive',
            account_id: accountId,
            file_id: file.fileId,
          },
          chunks
        );
      } finally {
        clearInterval(heartbeatTimer);
      }

      await markStatus(file.fileId, 'INDEXED', contentHash, null);
      indexed++;

      ctx.heartbeat({
        step: 'file_indexed',
        file_name: file.fileName,
        chunks: embedResult.total_chunks,
        newly_embedded: embedResult.newly_embedded,
        reused_from_cache: embedResult.reused_from_cache,
      });
    } catch (err) {
      failed++;
      const msg = err instanceof Error ? err.message : String(err);
      await markStatus(file.fileId, 'FAILED', null, msg.slice(0, 1000));
      ctx.heartbeat({ step: 'file_failed', file_name: file.fileName, error: msg });
    }
  }

  return {
    message: 'OneDrive document RAG pipeline complete',
    total_documents: total,
    indexed,
    reused,
    skipped,
    failed,
  };
}

async function markStatus(
  fileId: string,
  status: 'PENDING' | 'INDEXING' | 'INDEXED' | 'FAILED' | 'SKIPPED',
  contentHash: string | null,
  errorMsg: string | null
): Promise<void> {
  await db.oneDriveFile.update({
    where: { fileId },
    data: {
      indexStatus: status,
      indexedAt: status === 'INDEXED' ? new Date() : undefined,
      indexError: errorMsg,
      ...(contentHash ? { contentHash } : {}),
    },
  });
}

async function downloadOneDriveFile(accessToken: string, fileId: string): Promise<Buffer> {
  const resp = await fetch(`${GRAPH_BASE}/me/drive/items/${fileId}/content`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    redirect: 'follow',
  });
  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`OneDrive download ${resp.status}: ${body.slice(0, 200)}`);
  }
  const arrayBuffer = await resp.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
