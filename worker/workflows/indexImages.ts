import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities';

export interface IndexImagesInput {
  user_id: string;
  google_drive_account_id: string;
}

const { indexImagesForGoogleDriveAccount } = proxyActivities<typeof activities>({
  startToCloseTimeout: '2 hours',
  // Each Gemini Vision call can take 60s+ when free-tier 503s force retries
  // with exponential backoff. Bump heartbeat tolerance so the activity is not
  // killed mid-call. Worker still heartbeats between files for liveness.
  heartbeatTimeout: '5 minutes',
  retry: {
    maximumAttempts: 3,
    initialInterval: '10 seconds',
    backoffCoefficient: 2,
  },
});

/** Standalone workflow for admin re-index trigger (Phase 6.3). */
export async function indexImagesWorkflow(params: IndexImagesInput) {
  return await indexImagesForGoogleDriveAccount(params);
}
