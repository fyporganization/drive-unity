'use client';

import { useState, useTransition } from 'react';
import { Trash2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/hooks/use-toast';
import { deleteAllDuplicatesAction } from '@/lib/actions/bulk-delete.action';

interface Props {
  provider: 'google' | 'onedrive';
  driveId: string | null;
  duplicateCount: number;
  totalBytes: number;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** i).toFixed(1)} ${units[i]}`;
}

const PROVIDER_LABEL: Record<Props['provider'], string> = {
  google: 'Google Drive',
  onedrive: 'OneDrive',
};

export function DeleteDuplicatesButton({ provider, driveId, duplicateCount, totalBytes }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  if (!driveId || duplicateCount === 0) return null;

  const sizeLabel = formatBytes(totalBytes);
  const plural = duplicateCount === 1 ? '' : 's';

  const handleConfirm = () => {
    start(async () => {
      const result = await deleteAllDuplicatesAction(provider, { driveId });

      if (!result.success && result.error) {
        toast({
          title: 'Delete failed',
          description: result.error,
          variant: 'destructive',
        });
        setOpen(false);
        return;
      }

      const freedLabel = formatBytes(result.bytes_freed);
      const failedCount = result.failed.length;
      toast({
        title: `Deleted ${result.deleted.length} file${result.deleted.length === 1 ? '' : 's'}`,
        description:
          failedCount > 0
            ? `Freed ${freedLabel} · ${failedCount} file${failedCount === 1 ? '' : 's'} could not be deleted`
            : `Freed ${freedLabel}`,
      });

      queryClient.invalidateQueries({ queryKey: ['duplicates'] });
      queryClient.invalidateQueries({ queryKey: ['files'] });
      setOpen(false);
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={pending}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md border border-destructive text-destructive hover:bg-destructive/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5" />
        Delete {duplicateCount} duplicate{plural}
      </button>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        destructive
        title={`Delete ${duplicateCount} duplicate file${plural}?`}
        description={
          <>
            The oldest copy of each file is kept as the original — only newer copies will be deleted from your <strong>{PROVIDER_LABEL[provider]}</strong>. This action is permanent and cannot be undone.
          </>
        }
        details={
          <div className="rounded-md border bg-muted/40 p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Files to delete</span>
              <span className="font-medium">{duplicateCount}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-muted-foreground">Space freed</span>
              <span className="font-medium">{sizeLabel}</span>
            </div>
          </div>
        }
        confirmLabel={pending ? 'Deleting…' : `Delete ${duplicateCount} file${plural}`}
        cancelLabel="Cancel"
        pending={pending}
        onConfirm={handleConfirm}
      />
    </>
  );
}
