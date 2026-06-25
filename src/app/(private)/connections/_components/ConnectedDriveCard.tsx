"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  MoreVertical,
  Trash2,
  RefreshCw,
  Mail,
  CheckCircle2,
  Clock,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConnectedDrive } from "@/app/(private)/connections/hooks/useConnectedDrives";
import { DeleteDriveDialog } from "./DeleteDriveDialog";

interface ConnectedDriveCardProps {
  drive: ConnectedDrive;
  onDelete: (driveId: string) => void;
  onSync: (driveId: string) => void;
  isLoading?: boolean;
  isSyncing?: boolean;
  viewMode?: "grid" | "list";
}

export function ConnectedDriveCard({
                                     drive,
                                     onDelete,
                                     onSync,
                                     isLoading = false,
                                     isSyncing = false,
                                   }: ConnectedDriveCardProps) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const isDeleting = drive.deletionStatus === 'deleting';

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleConfirmDelete = () => {
    onDelete(drive.id);
    setDeleteModalOpen(false);
  };

  return (
      <>
        <Card className="rounded-xl border-border/50 shadow-soft hover:shadow-elevated transition-all duration-200 hover:-translate-y-0.5">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {drive.gmailAccount}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Connected {formatDate(drive.createdAt)}
                  </p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isDeleting}>
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => setDeleteModalOpen(true)}
                      disabled={isDeleting}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center justify-between">
              {isDeleting ? (
                <Badge className="bg-amber-50 text-amber-700 border-amber-200/60 hover:bg-amber-50">
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Disconnecting…
                </Badge>
              ) : (
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200/60 hover:bg-emerald-50">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Connected
                </Badge>
              )}
              <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => onSync(drive.id)}
                  disabled={isSyncing || isDeleting}
              >
                <RefreshCw
                    className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </CardContent>
        </Card>

        <DeleteDriveDialog
          open={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          title="Remove Drive Connection"
          accountLabel={drive.gmailAccount}
          onConfirm={handleConfirmDelete}
          disabled={isLoading}
        />
      </>
  );
}