'use client';

import { type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  /** Headline of the dialog. */
  title: ReactNode;
  /** Body copy explaining the action and its consequences. */
  description: ReactNode;
  /** Optional rich block (file list, summary, etc.) rendered below the description. */
  details?: ReactNode;
  /** Defaults to "Confirm". */
  confirmLabel?: string;
  /** Defaults to "Cancel". */
  cancelLabel?: string;
  /**
   * Style the confirm button as destructive (red). Set true for delete /
   * irreversible operations.
   */
  destructive?: boolean;
  /** Disables the confirm button and shows a "Working…" label. */
  pending?: boolean;
  /** Called when the user clicks the confirm button. */
  onConfirm: () => void;
}

/**
 * Reusable confirmation modal for destructive / irreversible actions. Replaces
 * window.alert / window.confirm patterns across the app. Pair with
 * `useToast()` for the result feedback.
 *
 *   const [open, setOpen] = useState(false);
 *   <ConfirmDialog
 *     open={open}
 *     onOpenChange={setOpen}
 *     title="Delete 47 duplicate files?"
 *     description="The originals are kept. This cannot be undone."
 *     destructive
 *     confirmLabel="Delete duplicates"
 *     pending={pending}
 *     onConfirm={() => start(async () => { ... })}
 *   />
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  details,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  pending = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {destructive ? (
              <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
            ) : null}
            <span>{title}</span>
          </DialogTitle>
          <DialogDescription className="pt-2 text-sm leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>

        {details ? <div className="mt-2">{details}</div> : null}

        <DialogFooter className="mt-4 gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={destructive ? 'destructive' : 'default'}
            onClick={onConfirm}
            disabled={pending}
          >
            {pending ? 'Working…' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
