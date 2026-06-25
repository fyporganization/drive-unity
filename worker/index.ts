import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NativeConnection, Worker } from '@temporalio/worker';
import * as activities from './activities';
import { TASK_QUEUE, TEMPORAL_ADDRESS, TEMPORAL_NAMESPACE } from './config';

const here = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const connection = await NativeConnection.connect({ address: TEMPORAL_ADDRESS });

  const worker = await Worker.create({
    connection,
    namespace: TEMPORAL_NAMESPACE,
    taskQueue: TASK_QUEUE,
    workflowsPath: path.join(here, 'workflows'),
    activities,
  });

  console.log(
    `[worker] ready · address=${TEMPORAL_ADDRESS} · namespace=${TEMPORAL_NAMESPACE} · taskQueue=${TASK_QUEUE}`
  );

  await worker.run();
}

main().catch((err) => {
  console.error('[worker] fatal error:', err);
  process.exit(1);
});
