'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type SyncStep = 'folders' | 'files' | 'ai' | 'completed' | 'pending';

interface ProgressEvent {
  workflow_id: string;
  status: string;
  is_terminal: boolean;
  step?: SyncStep;
  counts?: { folders: number; files: number };
  result?: unknown;
  error?: string;
}

interface SyncProgressProps {
  workflowId: string;
  accountId: string;
  provider: 'google' | 'onedrive';
  hasOtherAccounts: boolean;
}

const STEP_ORDER: Record<SyncStep, number> = {
  pending: 0,
  folders: 1,
  files: 2,
  ai: 3,
  completed: 4,
};

export function SyncProgress({
  workflowId,
  accountId,
  provider,
  hasOtherAccounts,
}: Readonly<SyncProgressProps>) {
  const router = useRouter();
  const [step, setStep] = useState<SyncStep>('pending');
  const [counts, setCounts] = useState<{ folders: number; files: number }>({
    folders: 0,
    files: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const navigatedRef = useRef(false);

  useEffect(() => {
    const url = `/api/sse/${workflowId}?accountId=${accountId}&provider=${provider}`;
    const es = new EventSource(url);

    es.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data) as ProgressEvent;
        if (event.step) setStep(event.step);
        if (event.counts) setCounts(event.counts);
        if (event.error) setError(event.error);

        const foldersReady = (event.counts?.folders ?? 0) > 0;
        const pastFolders =
          event.step === 'files' || event.step === 'ai' || event.step === 'completed';

        if (!navigatedRef.current && foldersReady && pastFolders) {
          navigatedRef.current = true;
          setTimeout(() => router.push('/dashboard'), 800);
        }
      } catch {
        // ignore malformed events
      }
    };

    return () => es.close();
  }, [workflowId, accountId, provider, router]);

  const providerLabel = provider === 'google' ? 'Google Drive' : 'OneDrive';

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold">Setting up your {providerLabel}</h1>
          <p className="text-sm text-muted-foreground">
            Hold on — this can take a few minutes for large drives. You can navigate
            away anytime; sync continues in the background.
          </p>
        </div>

        <div className="space-y-4 rounded-lg border bg-card p-5">
          <StepRow label={`Connected to ${providerLabel}`} state="done" detail={null} />
          <StepRow
            label="Loading folder structure"
            state={stateFor(step, 'folders')}
            detail={counts.folders > 0 ? `${counts.folders.toLocaleString()} folders` : null}
          />
          <StepRow
            label="Indexing files"
            state={stateFor(step, 'files')}
            detail={counts.files > 0 ? `${counts.files.toLocaleString()} files` : null}
          />
          <StepRow
            label="Preparing AI search"
            state={stateFor(step, 'ai')}
            detail={null}
          />
        </div>

        {error && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {hasOtherAccounts && (
          <div className="flex justify-center">
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              Go to dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function stateFor(current: SyncStep, target: SyncStep): 'done' | 'active' | 'pending' {
  const c = STEP_ORDER[current];
  const t = STEP_ORDER[target];
  if (c > t) return 'done';
  if (c === t) return 'active';
  return 'pending';
}

function StepRow({
  label,
  state,
  detail,
}: Readonly<{ label: string; state: 'done' | 'active' | 'pending'; detail: string | null }>) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5">
        {state === 'done' && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
        {state === 'active' && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
        {state === 'pending' && <Circle className="h-5 w-5 text-muted-foreground/40" />}
      </div>
      <div className="flex-1">
        <p className={state === 'pending' ? 'text-muted-foreground' : ''}>{label}</p>
        {detail && <p className="text-xs text-muted-foreground mt-0.5">{detail}</p>}
      </div>
    </div>
  );
}
