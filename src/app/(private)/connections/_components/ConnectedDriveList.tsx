"use client";

import { useState } from "react";
import {
  Trash2,
  RefreshCw,
  Mail,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  useConnectedDrives,
  useDeleteDrive,
} from "@/app/(private)/connections/hooks/useConnectedDrives";
import { DeleteDriveDialog } from "./DeleteDriveDialog";

interface ConnectedDrivesListProps {
  onSync?: (driveId: string) => void;
  syncingDriveId?: string | null;
}

export function ConnectedDrivesList({
                                      onSync,
                                      syncingDriveId = null,
                                    }: ConnectedDrivesListProps) {
  const { data, isLoading, isError } = useConnectedDrives();
  const deleteDrive = useDeleteDrive();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDrive, setSelectedDrive] = useState<{
    id: string;
    email: string;
  } | null>(null);

  const handleSync = (driveId: string) => {
    if (onSync) onSync(driveId);
  };

  const openDeleteModal = (driveId: string, email: string) => {
    setSelectedDrive({ id: driveId, email });
    setDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (selectedDrive) {
      deleteDrive.mutate({ driveId: selectedDrive.id });
      setDeleteModalOpen(false);
      setSelectedDrive(null);
    }
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading drives...</p>
        </div>
    );
  }

  if (isError) {
    return (
        <div className="rounded-xl bg-card border border-destructive/20 p-6 text-center">
          <p className="text-sm text-destructive font-medium">
            Failed to load drives
          </p>
        </div>
    );
  }

  if (!data || data.drives.length === 0) return null;

  return (
      <>
        <Card className="rounded-xl border-border/50 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">
                  Account
                </th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground hidden md:table-cell">
                  Connected
                </th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground hidden lg:table-cell">
                  Last Updated
                </th>
                <th className="text-right px-6 py-3 font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
              </thead>
              <tbody>
              {data.drives.map((drive) => (
                  <tr
                      key={drive.id}
                      className="border-b border-border/20 last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">
                        {drive.gmailAccount}
                      </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground hidden md:table-cell">
                      {formatDate(drive.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground hidden lg:table-cell">
                      {formatDate(drive.updatedAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleSync(drive.id)}
                            disabled={syncingDriveId === drive.id}
                        >
                          <RefreshCw
                              className={`w-4 h-4 ${
                                  syncingDriveId === drive.id ? "animate-spin" : ""
                              }`}
                          />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() =>
                                openDeleteModal(drive.id, drive.gmailAccount)
                            }
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
          </div>
        </Card>

        <DeleteDriveDialog
          open={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          title="Remove Drive Connection"
          accountLabel={selectedDrive?.email}
          onConfirm={handleDelete}
        />
      </>
  );
}