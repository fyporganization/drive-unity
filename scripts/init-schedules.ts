import { Client, Connection, ScheduleOverlapPolicy } from '@temporalio/client';
import type { ScheduleOptions } from '@temporalio/client';

const TEMPORAL_ADDRESS = process.env.TEMPORAL_ADDRESS || 'localhost:7233';
const TEMPORAL_NAMESPACE = process.env.TEMPORAL_NAMESPACE || 'default';
const TASK_QUEUE = process.env.TEMPORAL_TASK_QUEUE || 'multidrive-tasks';

interface ScheduleDef {
  id: string;
  description: string;
  workflowType: string;
  spec: { intervals?: { every: string }[]; cronExpressions?: string[] };
}

const SCHEDULES: ScheduleDef[] = [
  {
    id: 'multidrive-token-refresh',
    description: 'Hourly OAuth token refresh for all Drive accounts',
    workflowType: 'tokenRefreshWorkflow',
    spec: { intervals: [{ every: '1h' }] },
  },
  {
    id: 'multidrive-delta-sync',
    description: 'Every 15 minutes: trigger metadata sync for accounts past their lookback window',
    workflowType: 'deltaSyncWorkflow',
    spec: { intervals: [{ every: '15m' }] },
  },
  {
    id: 'multidrive-cleanup',
    description: 'Daily cleanup of expired cache entries, rate-limit counters, and orphan embeddings',
    workflowType: 'cleanupWorkflow',
    spec: { cronExpressions: ['0 0 * * *'] },
  },
];

async function main() {
  console.log(`[schedules] connecting to ${TEMPORAL_ADDRESS} namespace=${TEMPORAL_NAMESPACE}`);
  const connection = await Connection.connect({ address: TEMPORAL_ADDRESS });
  const client = new Client({ connection, namespace: TEMPORAL_NAMESPACE });

  for (const def of SCHEDULES) {
    const options: ScheduleOptions = {
      scheduleId: def.id,
      spec: def.spec,
      action: {
        type: 'startWorkflow',
        workflowType: def.workflowType,
        args: [],
        taskQueue: TASK_QUEUE,
      },
      policies: {
        overlap: ScheduleOverlapPolicy.SKIP,
        catchupWindow: '1 hour',
      },
    };

    try {
      await client.schedule.create(options);
      console.log(`[schedules] ✅ created ${def.id} (${def.description})`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/already exists|AlreadyExists/i.test(msg)) {
        const handle = client.schedule.getHandle(def.id);
        await handle.update(() => ({
          ...options,
          state: {},
        }));
        console.log(`[schedules] ♻️  updated existing ${def.id}`);
      } else {
        console.error(`[schedules] ❌ ${def.id}:`, msg);
        process.exitCode = 1;
      }
    }
  }

  await connection.close();
  console.log('[schedules] done');
}

main().catch((err) => {
  console.error('[schedules] fatal:', err);
  process.exit(1);
});
