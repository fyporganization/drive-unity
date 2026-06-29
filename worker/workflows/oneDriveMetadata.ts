import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities';

export interface OneDriveMetadataInput {
  user_id: string;
  one_drive_account_id: string;
}

export interface OneDriveMetadataResult {
  message: string;
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

const { fetchOneDriveMetadata } = proxyActivities<typeof activities>({
  startToCloseTimeout: '60 minutes',
  heartbeatTimeout: '60 seconds',
  retry: {
    maximumAttempts: 3,
    initialInterval: '5 seconds',
    backoffCoefficient: 2,
  },
});

const { indexDocumentsForOneDriveAccount } = proxyActivities<typeof activities>({
  startToCloseTimeout: '3 hours',
  heartbeatTimeout: '2 minutes',
  retry: {
    maximumAttempts: 2,
    initialInterval: '10 seconds',
    backoffCoefficient: 2,
  },
});

const { indexImagesForOneDriveAccount } = proxyActivities<typeof activities>({
  startToCloseTimeout: '2 hours',
  heartbeatTimeout: '5 minutes',
  retry: {
    maximumAttempts: 3,
    initialInterval: '10 seconds',
    backoffCoefficient: 2,
  },
});

export async function oneDriveMetadataWorkflow(
  params: OneDriveMetadataInput
): Promise<OneDriveMetadataResult> {
  const result = await fetchOneDriveMetadata(params);

  const documents = await indexDocumentsForOneDriveAccount(params);
  const images = await indexImagesForOneDriveAccount(params);

  return {
    message: 'OneDrive metadata + document + image RAG complete',
    folder_count: result.folders,
    file_count: result.files,
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
