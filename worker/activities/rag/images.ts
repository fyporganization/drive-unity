import { Context } from '@temporalio/activity';
import { db } from '@/lib/db';
import { buildDriveService } from '@/lib/google_client';
import { getValidGoogleDriveToken } from '@/lib/tokens/google';
import { chunkText } from '@/lib/chunking';
import { sha256 } from '@/lib/hash';
import { visionExtractBatch, type VisionBatchInput } from '@/lib/gemini';
import { embedAndUpsertChunks } from '../embed/chunks';

const IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
];

const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
const MIN_CAPTION_LENGTH = 20;
const VISION_BATCH_SIZE = 5;

export interface ImageRAGInput {
  user_id: string;
  google_drive_account_id: string;
}

export interface ImageRAGResult {
  message: string;
  total_images: number;
  indexed: number;
  reused: number;
  skipped: number;
  failed: number;
}

export async function indexImagesForGoogleDriveAccount(
  input: ImageRAGInput
): Promise<ImageRAGResult> {
  const ctx = Context.current();
  const { user_id: userId, google_drive_account_id: accountId } = input;

  ctx.heartbeat({ step: 'init' });

  const candidates = await db.googleDriveFile.findMany({
    where: {
      userId,
      googleDriveAccountId: accountId,
      mimeType: { in: IMAGE_MIME_TYPES },
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
    return { message: 'No images to index', total_images: 0, indexed: 0, reused: 0, skipped: 0, failed: 0 };
  }

  let indexed = 0;
  let reused = 0;
  let skipped = 0;
  let failed = 0;

  for (let batchStart = 0; batchStart < candidates.length; batchStart += VISION_BATCH_SIZE) {
    const slice = candidates.slice(batchStart, batchStart + VISION_BATCH_SIZE);

    ctx.heartbeat({
      step: 'batch_start',
      batch: Math.floor(batchStart / VISION_BATCH_SIZE) + 1,
      total_batches: Math.ceil(candidates.length / VISION_BATCH_SIZE),
      progress: `${indexed + reused + skipped + failed}/${total}`,
    });

    const batchEntries: {
      file: (typeof slice)[number];
      buffer: Buffer;
      contentHash: string;
    }[] = [];

    for (const file of slice) {
      if (file.fileSize && Number(file.fileSize) > MAX_IMAGE_BYTES) {
        await markStatus(file.fileId, 'SKIPPED', null, `Image too large: ${file.fileSize} bytes (>20MB Gemini limit)`);
        skipped++;
        continue;
      }

      try {
        await markStatus(file.fileId, 'INDEXING', null, null);
        const accessToken = await getValidGoogleDriveToken(accountId);
        const drive = buildDriveService(accessToken);
        const buffer = await downloadFile(drive, file.fileId);
        const contentHash = sha256(buffer);

        if (file.contentHash === contentHash) {
          await markStatus(file.fileId, 'INDEXED', contentHash, null);
          reused++;
          continue;
        }

        batchEntries.push({ file, buffer, contentHash });
      } catch (err) {
        failed++;
        const msg = err instanceof Error ? err.message : String(err);
        await markStatus(file.fileId, 'FAILED', null, msg.slice(0, 1000));
        ctx.heartbeat({ step: 'download_failed', file_name: file.fileName, error: msg });
      }
    }

    if (batchEntries.length === 0) continue;

    const visionInputs: VisionBatchInput[] = batchEntries.map((e, idx) => ({
      index: idx,
      bytes: e.buffer,
      mimeType: e.file.mimeType,
    }));

    const heartbeatTimer = setInterval(() => {
      ctx.heartbeat({
        step: 'vision_batch_pending',
        batch_size: visionInputs.length,
      });
    }, 30_000);

    let visionResults;
    try {
      ctx.heartbeat({ step: 'vision_batch', batch_size: visionInputs.length });
      visionResults = await visionExtractBatch(visionInputs);
    } finally {
      clearInterval(heartbeatTimer);
    }

    for (let i = 0; i < batchEntries.length; i++) {
      const entry = batchEntries[i];
      const visionResult = visionResults.find((r) => r.index === i);

      try {
        if (!visionResult || visionResult.error || !visionResult.caption) {
          const errMsg = visionResult?.error ?? 'No caption returned from batch';
          await markStatus(entry.file.fileId, 'FAILED', entry.contentHash, errMsg.slice(0, 1000));
          failed++;
          continue;
        }

        const caption = visionResult.caption;
        if (caption.trim().length < MIN_CAPTION_LENGTH) {
          await markStatus(entry.file.fileId, 'SKIPPED', entry.contentHash, `Caption too short (${caption.length} chars)`);
          skipped++;
          continue;
        }

        const chunks = chunkText(caption);
        const embedResult = await embedAndUpsertChunks(
          {
            user_id: userId,
            provider_type: 'google',
            account_id: accountId,
            file_id: entry.file.fileId,
          },
          chunks
        );

        await markStatus(entry.file.fileId, 'INDEXED', entry.contentHash, null);
        indexed++;

        ctx.heartbeat({
          step: 'file_indexed',
          file_name: entry.file.fileName,
          chunks: embedResult.total_chunks,
          newly_embedded: embedResult.newly_embedded,
          reused_from_cache: embedResult.reused_from_cache,
        });
      } catch (err) {
        failed++;
        const msg = err instanceof Error ? err.message : String(err);
        await markStatus(entry.file.fileId, 'FAILED', entry.contentHash, msg.slice(0, 1000));
        ctx.heartbeat({ step: 'embed_failed', file_name: entry.file.fileName, error: msg });
      }
    }
  }

  return {
    message: 'Image RAG pipeline complete',
    total_images: total,
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
  await db.googleDriveFile.update({
    where: { fileId },
    data: {
      indexStatus: status,
      indexedAt: status === 'INDEXED' ? new Date() : undefined,
      indexError: errorMsg,
      ...(contentHash ? { contentHash } : {}),
    },
  });
}

async function downloadFile(drive: ReturnType<typeof buildDriveService>, fileId: string): Promise<Buffer> {
  const resp = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'arraybuffer' }
  );
  return Buffer.from(resp.data as ArrayBuffer);
}
