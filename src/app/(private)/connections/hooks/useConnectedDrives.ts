// useConnectedDrives.ts - Updated types and hooks
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export interface ConnectedDrive {
  id: string;
  gmailAccount: string;
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

interface DrivesResponse {
  success: boolean;
  drives: ConnectedDrive[];
  totalCount: number;
  subscription?: SubscriptionInfo;
}

interface DeleteDriveParams {
  driveId: string;
}

export function useConnectedDrives() {
  return useQuery<DrivesResponse>({
    queryKey: ['connected-drives'],
    queryFn: async () => {
      const response = await fetch('/api/googleDrive/connect', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch connected drives');
      }

      return response.json();
    },
    // Auto-refresh while any account is being deleted, so the row vanishes
    // automatically once the background workflow finishes.
    refetchInterval: (query) => {
      const data = query.state.data;
      const anyDeleting = data?.drives?.some((d) => d.deletionStatus === 'deleting');
      return anyDeleting ? 10_000 : false;
    },
  });
}

export function useDeleteDrive() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ driveId }: DeleteDriveParams) => {
      const response = await fetch(`/api/googleDrive/connect?driveId=${driveId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to disconnect drive');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connected-drives'] });
      queryClient.invalidateQueries({ queryKey: ['fileData'] });

      toast({
        title: 'Success',
        description: 'Drive disconnected successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to disconnect drive',
        variant: 'destructive',
      });
    },
  });
}