"use client";

import { useState } from "react";
import {
    Trash2,
    RefreshCw,
    AlertCircle,
    Loader2,
} from "lucide-react";
import { IconBrandOnedrive } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    useConnectedOneDrives,
    useDeleteOneDrive,
} from "@/app/(private)/connections/hooks/useConnectedOneDrive";
import { DeleteDriveDialog } from "./DeleteDriveDialog";

interface ConnectedOneDrivesListProps {
    onSync?: (driveId: string) => void;
    syncingDriveId?: string | null;
}

export function ConnectedOneDrivesList({
                                           onSync,
                                           syncingDriveId = null,
                                       }: ConnectedOneDrivesListProps) {
    const { data, isLoading, isError } = useConnectedOneDrives();
    const deleteOneDrive = useDeleteOneDrive();

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
            deleteOneDrive.mutate({ driveId: selectedDrive.id });
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
                <Loader2 className="w-6 h-6 animate-spin text-[#0078D4]" />
                <p className="text-sm text-muted-foreground">Loading OneDrives...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="rounded-xl bg-card border border-destructive/20 p-6 text-center">
                <div className="flex items-center justify-center gap-2">
                    <AlertCircle className="w-5 h-5 text-destructive" />
                    <p className="text-sm text-destructive font-medium">
                        Failed to load OneDrives
                    </p>
                </div>
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
                        <tr className="border-b border-border/50 bg-[#0078D4]/5">
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
                                className="border-b border-border/20 last:border-0 hover:bg-[#0078D4]/5 transition-colors"
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-[#0078D4] flex items-center justify-center">
                                            <IconBrandOnedrive size={20} color="white" />
                                        </div>
                                        <span className="font-medium text-foreground">
                                            {drive.onedriveAccount}
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
                                                openDeleteModal(drive.id, drive.onedriveAccount)
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
                title="Remove OneDrive Connection"
                accountLabel={selectedDrive?.email}
                onConfirm={handleDelete}
                loading={deleteOneDrive.isPending}
            />
        </>
    );
}