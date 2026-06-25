import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { getTemporalClient } from '@/lib/temporal-client';

const POLL_INTERVAL_MS = 2000;
const MAX_DURATION_MS = 5 * 60 * 1000;

const TERMINAL_STATUSES = new Set(['COMPLETED', 'FAILED', 'CANCELED', 'TERMINATED', 'TIMED_OUT']);

type SyncStep = 'folders' | 'files' | 'ai' | 'completed' | 'pending';

const ACTIVITY_TO_STEP: Record<string, SyncStep> = {
  fetchDriveFolders: 'folders',
  fetchOneDriveMetadata: 'folders',
  getAllFilesFromFolders: 'files',
  syncDriveChanges: 'files',
  indexDocumentsForGoogleDriveAccount: 'ai',
  indexImagesForGoogleDriveAccount: 'ai',
};

interface StatusEvent {
  workflow_id: string;
  status: string;
  is_terminal: boolean;
  step?: SyncStep;
  counts?: { folders: number; files: number };
  result?: unknown;
  error?: string;
  timestamp: string;
}

/**
 * Server-Sent Events stream of workflow status + sync progress.
 *
 *   const es = new EventSource(`/api/sse/${workflowId}?accountId=X&provider=google`);
 *   es.onmessage = (e) => updateUI(JSON.parse(e.data));
 *
 * When accountId+provider are passed, each event also includes:
 *   - step: which phase the workflow is in (folders/files/ai/completed)
 *   - counts: live folder + file counts from DB
 *
 * Closes automatically on terminal workflow status.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ workflowId: string }> }
) {
  const session = await getSession();
  if (!session?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { workflowId } = await context.params;
  if (!workflowId) {
    return new Response('Missing workflowId', { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get('accountId');
  const provider = searchParams.get('provider') as 'google' | 'onedrive' | null;

  const stream = new ReadableStream({
    async start(controller) {
      const client = await getTemporalClient();
      const handle = client.workflow.getHandle(workflowId);
      const encoder = new TextEncoder();
      const startedAt = Date.now();
      let active = true;

      request.signal.addEventListener('abort', () => {
        active = false;
      });

      const send = (event: StatusEvent) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      try {
        while (active && Date.now() - startedAt < MAX_DURATION_MS) {
          const description = await handle.describe();
          const statusName = description.status.name;
          const isTerminal = TERMINAL_STATUSES.has(statusName);

          const pending = description.raw?.pendingActivities?.[0];
          const activeActivity = pending?.activityType?.name ?? undefined;
          const step: SyncStep = isTerminal
            ? 'completed'
            : activeActivity && ACTIVITY_TO_STEP[activeActivity]
              ? ACTIVITY_TO_STEP[activeActivity]
              : 'pending';

          const event: StatusEvent = {
            workflow_id: workflowId,
            status: statusName,
            is_terminal: isTerminal,
            step,
            timestamp: new Date().toISOString(),
          };

          if (accountId && provider) {
            event.counts = await readCounts(provider, accountId);
          }

          if (isTerminal) {
            try {
              event.result = await handle.result();
            } catch (err) {
              event.error = err instanceof Error ? err.message : String(err);
            }
            send(event);
            break;
          }

          send(event);
          await sleep(POLL_INTERVAL_MS);
        }
      } catch (err) {
        const errEvent: StatusEvent = {
          workflow_id: workflowId,
          status: 'STREAM_ERROR',
          is_terminal: true,
          error: err instanceof Error ? err.message : String(err),
          timestamp: new Date().toISOString(),
        };
        send(errEvent);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}

async function readCounts(
  provider: 'google' | 'onedrive',
  accountId: string
): Promise<{ folders: number; files: number }> {
  if (provider === 'google') {
    const [folders, files] = await Promise.all([
      db.googleDriveFolder.count({ where: { googleDriveAccountId: accountId } }),
      db.googleDriveFile.count({ where: { googleDriveAccountId: accountId } }),
    ]);
    return { folders, files };
  }
  const [folders, files] = await Promise.all([
    db.oneDriveFolder.count({ where: { oneDriveAccountId: accountId } }),
    db.oneDriveFile.count({ where: { oneDriveAccountId: accountId } }),
  ]);
  return { folders, files };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
