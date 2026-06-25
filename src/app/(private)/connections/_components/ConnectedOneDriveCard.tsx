"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    MoreVertical,
    Trash2,
    RefreshCw,
    CheckCircle2,
    Cloud,
    Loader2,
} from "lucide-react";
import { IconBrandOnedrive } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConnectedOneDrive } from "@/app/(private)/connections/hooks/useConnectedOneDrive";
import { DeleteDriveDialog } from "./DeleteDriveDialog";

interface ConnectedOneDriveCardProps {
    drive: ConnectedOneDrive;
    onDelete: (driveId: string) => void;
    onSync: (driveId: string) => void;
    isLoading?: boolean;
    isSyncing?: boolean;
    viewMode?: "grid" | "list";
}

export function ConnectedOneDriveCard({
                                          drive,
                                          onDelete,
                                          onSync,
                                          isLoading = false,
                                          isSyncing = false,
                                      }: ConnectedOneDriveCardProps) {
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
            <Card className="rounded-xl border-[#0078D4]/30 shadow-soft hover:shadow-elevated transition-all duration-200 hover:-translate-y-0.5 overflow-hidden">
                <div className="bg-gradient-to-br from-[#0078D4] to-[#0063B1] p-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />

                    <div className="relative flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-white shadow-lg flex items-center justify-center">
                                <IconBrandOnedrive size={28} color="#0078D4" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-medium text-white/90 mb-0.5">
                                    OneDrive
                                </p>
                                <div className="flex items-center gap-1.5">
                                    <Cloud className="w-3 h-3 text-white/80" />
                                    <p className="text-xs text-white/80">
                                        Connected
                                    </p>
                                </div>
                            </div>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-white/90 hover:bg-white/20 hover:text-white"
                                    disabled={isDeleting}
                                >
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
                                    Disconnect
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <CardContent className="p-6 space-y-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-4 h-4 rounded-full bg-[#0078D4]/20 flex items-center justify-center">
                                <CheckCircle2 className="w-3 h-3 text-[#0078D4]" />
                            </div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Connected Account
                            </p>
                        </div>
                        <p className="text-sm font-semibold text-foreground truncate">
                            {drive.onedriveAccount}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Connected {formatDate(drive.createdAt)}
                        </p>
                    </div>

                    {isDeleting && (
                        <Badge className="w-full justify-center bg-amber-50 text-amber-700 border-amber-200/60 hover:bg-amber-50 py-1.5">
                            <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                            Disconnecting…
                        </Badge>
                    )}
                    <Button
                        className="w-full bg-[#0078D4] hover:bg-[#0063B1] text-white shadow-md"
                        onClick={() => onSync(drive.id)}
                        disabled={isSyncing || isLoading || isDeleting}
                    >
                        <RefreshCw
                            className={`w-4 h-4 mr-2 ${isSyncing ? "animate-spin" : ""}`}
                        />
                        {isSyncing ? "Syncing..." : "Sync Drive"}
                    </Button>
                </CardContent>
            </Card>

            <DeleteDriveDialog
                open={deleteModalOpen}
                onOpenChange={setDeleteModalOpen}
                title="Remove OneDrive Connection"
                accountLabel={drive.onedriveAccount}
                onConfirm={handleConfirmDelete}
                disabled={isLoading}
            />
        </>
    );
}