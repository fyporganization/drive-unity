'use client';

import { useTransition } from 'react';
import {
  backfillGoogleDriveAccountsAction,
  backfillOneDriveAccountsAction,
} from '@/lib/actions/admin-backfill.action';

interface Props {
  userId: string;
  accountId: string;
  provider: 'google' | 'onedrive';
}

export function BackfillAccountButton({ accountId, provider }: Props) {
  const [pending, start] = useTransition();
  const action = provider === 'google' ? backfillGoogleDriveAccountsAction : backfillOneDriveAccountsAction;

  const onClick = () => {
    start(async () => {
      const result = await action({ accountIds: [accountId] });
      if (!result.success) {
        alert(`Backfill failed: ${result.error ?? result.failed[0]?.error ?? 'unknown'}`);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="px-3 py-1.5 text-xs font-medium rounded-md border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? 'Backfilling…' : 'Retry account'}
    </button>
  );
}
