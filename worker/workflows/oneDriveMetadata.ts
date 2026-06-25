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

/**
 * Port of Python `OneDriveMetaDataWorkflow`. Phase 2.2 covers folder + file
 * metadata sync; RAG activities (documents + images) are added in Phase 3.
 */
export async function oneDriveMetadataWorkflow(
  params: OneDriveMetadataInput
): Promise<OneDriveMetadataResult> {
  const result = await fetchOneDriveMetadata(params);
  return {
    message: 'OneDrive metadata synced successfully',
    folder_count: result.folders,
    file_count: result.files,
  };
}
