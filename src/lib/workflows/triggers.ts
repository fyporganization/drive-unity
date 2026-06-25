import { WorkflowIdConflictPolicy } from '@temporalio/common';
import { getTemporalClient, TASK_QUEUE } from '@/lib/temporal-client';
import { db } from '@/lib/db';

export interface SyncTriggerResult {
  workflow_id: string;
  run_id: string | undefined;
  status: 'started';
}

/**
 * Fire-and-forget triggers for the Drive metadata + RAG workflows. All HTTP
 * surfaces (OAuth callbacks, manual re-sync routes, admin re-index Server
 * Actions) flow through these helpers — single source of truth for workflow
 * IDs, task queue, and conflict policy.
 *
 *   - Workflow ID is deterministic per (provider, user, account). Calling the
 *     trigger while a run is already in flight returns the existing handle
 *     (USE_EXISTING) instead of starting a duplicate.
 *   - HTTP response returns immediately; the workflow runs on the worker.
 */
export async function triggerGoogleDriveSync(
  userId: string,
  accountId: string
): Promise<SyncTriggerResult> {
  const client = await getTemporalClient();
  const workflowId = `gdrive-sync-${userId}-${accountId}`;
  const handle = await client.workflow.start('googleDriveMetadataWorkflow', {
    args: [{ user_id: userId, google_drive_account_id: accountId }],
    taskQueue: TASK_QUEUE,
    workflowId,
    workflowIdConflictPolicy: WorkflowIdConflictPolicy.USE_EXISTING,
  });
  return {
    workflow_id: handle.workflowId,
    run_id: handle.firstExecutionRunId,
    status: 'started',
  };
}

export async function triggerOneDriveSync(
  userId: string,
  accountId: string
): Promise<SyncTriggerResult> {
  const client = await getTemporalClient();
  const workflowId = `onedrive-sync-${userId}-${accountId}`;
  const handle = await client.workflow.start('oneDriveMetadataWorkflow', {
    args: [{ user_id: userId, one_drive_account_id: accountId }],
    taskQueue: TASK_QUEUE,
    workflowId,
    workflowIdConflictPolicy: WorkflowIdConflictPolicy.USE_EXISTING,
  });
  return {
    workflow_id: handle.workflowId,
    run_id: handle.firstExecutionRunId,
    status: 'started',
  };
}

export async function triggerGoogleDriveAccountDelete(
  accountId: string
): Promise<SyncTriggerResult> {
  const client = await getTemporalClient();
  const workflowId = `gdrive-delete-${accountId}`;
  const handle = await client.workflow.start('deleteGoogleDriveAccountWorkflow', {
    args: [{ account_id: accountId }],
    taskQueue: TASK_QUEUE,
    workflowId,
    workflowIdConflictPolicy: WorkflowIdConflictPolicy.USE_EXISTING,
  });
  return {
    workflow_id: handle.workflowId,
    run_id: handle.firstExecutionRunId,
    status: 'started',
  };
}

export async function triggerOneDriveAccountDelete(
  accountId: string
): Promise<SyncTriggerResult> {
  const client = await getTemporalClient();
  const workflowId = `onedrive-delete-${accountId}`;
  const handle = await client.workflow.start('deleteOneDriveAccountWorkflow', {
    args: [{ account_id: accountId }],
    taskQueue: TASK_QUEUE,
    workflowId,
    workflowIdConflictPolicy: WorkflowIdConflictPolicy.USE_EXISTING,
  });
  return {
    workflow_id: handle.workflowId,
    run_id: handle.firstExecutionRunId,
    status: 'started',
  };
}

export interface BackfillResetCounts {
  google_drive_files_reset: number;
  one_drive_files_reset: number;
}

/**
 * Reset every indexed file under an account back to PENDING + clear
 * content_hash. The next sync workflow run will re-download, re-extract, and
 * re-embed every file. Chunk-level dedup (via chunk_hash unique) still kicks
 * in, so unchanged content reuses existing Gemini embeddings.
 */
export async function resetGoogleDriveAccountForBackfill(
  accountId: string
): Promise<number> {
  const result = await db.googleDriveFile.updateMany({
    where: { googleDriveAccountId: accountId },
    data: { indexStatus: 'PENDING', contentHash: null, indexError: null, indexedAt: null },
  });
  return result.count;
}

export async function resetOneDriveAccountForBackfill(
  accountId: string
): Promise<number> {
  const result = await db.oneDriveFile.updateMany({
    where: { oneDriveAccountId: accountId },
    data: { indexStatus: 'PENDING', contentHash: null, indexError: null, indexedAt: null },
  });
  return result.count;
}

export interface BackfillTriggerResult extends SyncTriggerResult {
  reset_count: number;
}

/**
 * Force a full re-index for an account: reset every file to PENDING, then
 * start the metadata workflow with a fresh (backfill-prefixed) workflow ID so
 * it doesn't collide with any in-flight regular sync.
 */
export async function triggerGoogleDriveBackfill(
  userId: string,
  accountId: string
): Promise<BackfillTriggerResult> {
  const resetCount = await resetGoogleDriveAccountForBackfill(accountId);
  const client = await getTemporalClient();
  const workflowId = `gdrive-backfill-${userId}-${accountId}-${Date.now()}`;
  const handle = await client.workflow.start('googleDriveMetadataWorkflow', {
    args: [{ user_id: userId, google_drive_account_id: accountId }],
    taskQueue: TASK_QUEUE,
    workflowId,
    workflowIdConflictPolicy: WorkflowIdConflictPolicy.USE_EXISTING,
  });
  return {
    workflow_id: handle.workflowId,
    run_id: handle.firstExecutionRunId,
    status: 'started',
    reset_count: resetCount,
  };
}

export async function triggerOneDriveBackfill(
  userId: string,
  accountId: string
): Promise<BackfillTriggerResult> {
  const resetCount = await resetOneDriveAccountForBackfill(accountId);
  const client = await getTemporalClient();
  const workflowId = `onedrive-backfill-${userId}-${accountId}-${Date.now()}`;
  const handle = await client.workflow.start('oneDriveMetadataWorkflow', {
    args: [{ user_id: userId, one_drive_account_id: accountId }],
    taskQueue: TASK_QUEUE,
    workflowId,
    workflowIdConflictPolicy: WorkflowIdConflictPolicy.USE_EXISTING,
  });
  return {
    workflow_id: handle.workflowId,
    run_id: handle.firstExecutionRunId,
    status: 'started',
    reset_count: resetCount,
  };
}
