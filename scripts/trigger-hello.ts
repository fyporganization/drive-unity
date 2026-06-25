import { Client, Connection } from '@temporalio/client';
import { helloWorkflow } from '../worker/workflows/hello';

const TEMPORAL_ADDRESS = process.env.TEMPORAL_ADDRESS || 'localhost:7233';
const TEMPORAL_NAMESPACE = process.env.TEMPORAL_NAMESPACE || 'default';
const TASK_QUEUE = process.env.TEMPORAL_TASK_QUEUE || 'multidrive-tasks';

async function main() {
  const connection = await Connection.connect({ address: TEMPORAL_ADDRESS });
  const client = new Client({ connection, namespace: TEMPORAL_NAMESPACE });

  const workflowId = `hello-${Date.now()}`;
  const handle = await client.workflow.start(helloWorkflow, {
    args: ['Multi-Drive'],
    taskQueue: TASK_QUEUE,
    workflowId,
  });

  console.log(`[trigger] started workflow ${workflowId}`);
  const result = await handle.result();
  console.log(`[trigger] result: ${result}`);
  await connection.close();
}

main().catch((err) => {
  console.error('[trigger] failed:', err);
  process.exit(1);
});
