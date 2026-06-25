"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeleteDriveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountLabel?: string;
  /** Title shown in the header. e.g. "Remove Drive Connection" or "Remove OneDrive Connection". */
  title: string;
  onConfirm: () => void;
  disabled?: boolean;
  /** When true the confirm button shows a spinner with "Removing…". */
  loading?: boolean;
}

export function DeleteDriveDialog({
  open,
  onOpenChange,
  accountLabel,
  title,
  onConfirm,
  disabled,
  loading,
}: Readonly<DeleteDriveDialogProps>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {"Are you sure you want to disconnect "}
            <span className="font-medium text-foreground">{accountLabel}</span>
            {"? This will remove all indexed data from this account."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={disabled || loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Removing...
              </>
            ) : (
              "Remove"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
