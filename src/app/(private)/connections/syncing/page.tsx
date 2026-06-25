import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { SyncProgress } from './SyncProgress';

interface PageProps {
  searchParams: Promise<{
    workflowId?: string;
    accountId?: string;
    provider?: string;
  }>;
}

export default async function SyncingPage({ searchParams }: PageProps) {
  const session = await getSession();
  if (!session?.id) {
    redirect('/auth/sign-in');
  }

  const { workflowId, accountId, provider } = await searchParams;
  if (!workflowId || !accountId || !provider) {
    redirect('/connections');
  }

  const [googleCount, oneDriveCount] = await Promise.all([
    db.googleDriveAccount.count({ where: { userId: session.id } }),
    db.oneDriveAccount.count({ where: { userId: session.id } }),
  ]);
  const hasOtherAccounts = googleCount + oneDriveCount > 1;

  return (
    <SyncProgress
      workflowId={workflowId}
      accountId={accountId}
      provider={provider as 'google' | 'onedrive'}
      hasOtherAccounts={hasOtherAccounts}
    />
  );
}
