// Server-side module. Imported by Server Actions, route handlers, and Temporal
// worker activities. Never bundle into a Client Component (no API key here,
// but it opens persistent gRPC connections you don't want on the browser).
import { Client, Connection } from '@temporalio/client';

const TEMPORAL_ADDRESS = process.env.TEMPORAL_ADDRESS || 'localhost:7233';
const TEMPORAL_NAMESPACE = process.env.TEMPORAL_NAMESPACE || 'default';

export const TASK_QUEUE = process.env.TEMPORAL_TASK_QUEUE || 'multidrive-tasks';

let clientPromise: Promise<Client> | null = null;

export function getTemporalClient(): Promise<Client> {
  if (!clientPromise) {
    clientPromise = (async () => {
      const connection = await Connection.connect({ address: TEMPORAL_ADDRESS });
      return new Client({ connection, namespace: TEMPORAL_NAMESPACE });
    })().catch((err) => {
      clientPromise = null;
      throw err;
    });
  }
  return clientPromise;
}
