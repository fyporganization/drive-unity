import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities';

export interface DeleteAccountInput {
  account_id: string;
}

export interface DeleteAccountResult {
  message: string;
  files_deleted: number;
  folders_deleted: number;
  chunks_deleted: number;
}

const { deleteGoogleDriveAccountData, deleteOneDriveAccountData } = proxyActivities<
  typeof activities
>({
  startToCloseTimeout: '60 minutes',
  heartbeatTimeout: '60 seconds',
  retry: {
    maximumAttempts: 5,
    initialInterval: '10 seconds',
    backoffCoefficient: 2,
  },
});

export async function deleteGoogleDriveAccountWorkflow(
  params: DeleteAccountInput
): Promise<DeleteAccountResult> {
  return deleteGoogleDriveAccountData(params);
}

export async function deleteOneDriveAccountWorkflow(
  params: DeleteAccountInput
): Promise<DeleteAccountResult> {
  return deleteOneDriveAccountData(params);
}
