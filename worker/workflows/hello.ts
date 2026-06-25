import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities';

const { hello } = proxyActivities<typeof activities>({
  startToCloseTimeout: '30 seconds',
});

export async function helloWorkflow(name: string): Promise<string> {
  return await hello(name);
}
