import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export interface ConnectedOneDrive {
    id: string;
    onedriveAccount: string;
    createdAt: string;
    updatedAt: string | null;
    deletionStatus: 'active' | 'deleting';
}

interface SubscriptionInfo {
    maxConnectedDrives: number;
    tier: string;
    packageName: string;
    canAddMore: boolean;
    remainingSlots: number;
}

interface OneDrivesResponse {
    success: boolean;
    drives: ConnectedOneDrive[];
    totalCount: number;
    subscription?: SubscriptionInfo;
}

interface DeleteOneDriveParams {
    driveId: string;
}

export function useConnectedOneDrives() {
    return useQuery<OneDrivesResponse>({
        queryKey: ['connected-onedrives'],
        queryFn: async () => {
            const response = await fetch('/api/onedrive/connect', {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch connected OneDrives');
            }

            return response.json();
        },
        refetchInterval: (query) => {
            const data = query.state.data;
            const anyDeleting = data?.drives?.some((d) => d.deletionStatus === 'deleting');
            return anyDeleting ? 10_000 : false;
        },
    });
}

export function useDeleteOneDrive() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async ({ driveId }: DeleteOneDriveParams) => {
            const response = await fetch(`/api/onedrive/connect?driveId=${driveId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to disconnect OneDrive');
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['connected-onedrives'] });
            queryClient.invalidateQueries({ queryKey: ['fileData'] });

            toast({
                title: 'Success',
                description: 'OneDrive disconnected successfully',
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Error',
                description: error.message || 'Failed to disconnect OneDrive',
                variant: 'destructive',
            });
        },
    });
}