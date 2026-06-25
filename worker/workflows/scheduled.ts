import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities';

const { refreshAllDriveTokens } = proxyActivities<typeof activities>({
  startToCloseTimeout: '10 minutes',
  heartbeatTimeout: '60 seconds',
  retry: {
    maximumAttempts: 2,
    initialInterval: '30 seconds',
    backoffCoefficient: 2,
  },
});

const { triggerAllDeltaSyncs } = proxyActivities<typeof activities>({
  startToCloseTimeout: '5 minutes',
  heartbeatTimeout: '60 seconds',
  retry: {
    maximumAttempts: 2,
    initialInterval: '10 seconds',
    backoffCoefficient: 2,
  },
});

const { runDailyCleanup } = proxyActivities<typeof activities>({
  startToCloseTimeout: '10 minutes',
  heartbeatTimeout: '60 seconds',
  retry: {
    maximumAttempts: 2,
    initialInterval: '30 seconds',
    backoffCoefficient: 2,
  },
});

/** Cron: hourly. Refreshes OAuth tokens for every Drive account. */
export async function tokenRefreshWorkflow() {
  return await refreshAllDriveTokens();
}

/** Cron: every 15 min. Fans out per-account metadata workflows. */
export async function deltaSyncWorkflow() {
  return await triggerAllDeltaSyncs();
}

/** Cron: daily. Purges expired cache, rate-limit, and orphan embeddings. */
export async function cleanupWorkflow() {
  return await runDailyCleanup();
}
