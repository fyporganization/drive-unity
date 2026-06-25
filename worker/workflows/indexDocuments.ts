import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities';

export interface IndexDocumentsInput {
  user_id: string;
  google_drive_account_id: string;
}

const { indexDocumentsForGoogleDriveAccount } = proxyActivities<typeof activities>({
  // Document download + extract + embed is the longest-running activity per
  // account. Allow up to 3h, heartbeat every 2 min (matches Python).
  startToCloseTimeout: '3 hours',
  heartbeatTimeout: '2 minutes',
  retry: {
    maximumAttempts: 2,
    initialInterval: '10 seconds',
    backoffCoefficient: 2,
  },
});

/** Standalone workflow — useful for admin "re-index" trigger (Phase 6.3). */
export async function indexDocumentsWorkflow(params: IndexDocumentsInput) {
  return await indexDocumentsForGoogleDriveAccount(params);
}
