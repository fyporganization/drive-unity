import { ActivityFailure, ApplicationFailure, proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities';

// Sentinel string matching INVALID_SYNC_TOKEN in worker/activities/drive/google.ts.
// Inlined here to keep workflow imports side-effect-free.
const INVALID_SYNC_TOKEN = 'InvalidSyncToken';

export interface GoogleDriveMetadataInput {
  user_id: string;
  google_drive_account_id: string;
}

export interface GoogleDriveMetadataResult {
  message: string;
  sync_mode: 'full' | 'incremental';
  folder_count: number;
  file_count: number;
  rag: {
    documents: {
      total: number;
      indexed: number;
      reused: number;
      skipped: number;
      failed: number;
    };
    images: {
      total: number;
      indexed: number;
      reused: number;
      skipped: number;
      failed: number;
    };
  };
}

const { fetchDriveFolders, getAllFilesFromFolders, syncDriveChanges } = proxyActivities<
  typeof activities
>({
  startToCloseTimeout: '60 minutes',
  heartbeatTimeout: '60 seconds',
  retry: {
    maximumAttempts: 3,
    initialInterval: '5 seconds',
    backoffCoefficient: 2,
  },
});

const { indexDocumentsForGoogleDriveAccount } = proxyActivities<typeof activities>({
  startToCloseTimeout: '3 hours',
  heartbeatTimeout: '2 minutes',
  retry: {
    maximumAttempts: 2,
    initialInterval: '10 seconds',
    backoffCoefficient: 2,
  },
});

const { indexImagesForGoogleDriveAccount } = proxyActivities<typeof activities>({
  startToCloseTimeout: '2 hours',
  // 5 min tolerance — accommodates Gemini Vision retry backoff under 503s.
  heartbeatTimeout: '5 minutes',
  retry: {
    maximumAttempts: 3,
    initialInterval: '10 seconds',
    backoffCoefficient: 2,
  },
});

/**
 * Drive metadata workflow. First attempts incremental sync via the Changes API
 * (cheap: 1-3 calls, seconds). Falls back to a full folder+file scan only when
 * the saved cursor is missing or expired. RAG indexing runs after either path.
 */
export async function googleDriveMetadataWorkflow(
  params: GoogleDriveMetadataInput
): Promise<GoogleDriveMetadataResult> {
  let syncMode: 'full' | 'incremental' = 'incremental';
  let folderCount = 0;
  let fileCount = 0;

  try {
    const incr = await syncDriveChanges(params);
    folderCount = incr.changed_folders + incr.deleted_folders;
    fileCount = incr.changed_files + incr.deleted_files;
  } catch (err) {
    if (isInvalidSyncToken(err)) {
      syncMode = 'full';
      folderCount = await fetchDriveFolders(params);
      const filesResult = await getAllFilesFromFolders(params);
      fileCount = filesResult.total;
    } else {
      throw err;
    }
  }

  const documents = await indexDocumentsForGoogleDriveAccount(params);
  const images = await indexImagesForGoogleDriveAccount(params);

  return {
    message: `Drive metadata + document + image RAG complete (${syncMode})`,
    sync_mode: syncMode,
    folder_count: folderCount,
    file_count: fileCount,
    rag: {
      documents: {
        total: documents.total_documents,
        indexed: documents.indexed,
        reused: documents.reused,
        skipped: documents.skipped,
        failed: documents.failed,
      },
      images: {
        total: images.total_images,
        indexed: images.indexed,
        reused: images.reused,
        skipped: images.skipped,
        failed: images.failed,
      },
    },
  };
}

function isInvalidSyncToken(err: unknown): boolean {
  return (
    err instanceof ActivityFailure &&
    err.cause instanceof ApplicationFailure &&
    err.cause.type === INVALID_SYNC_TOKEN
  );
}
