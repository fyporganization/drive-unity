import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface SyncDriveParams {
  driveId: string;
}

interface SyncDriveResponse {
  status: string;
  message: string;
}

async function syncDrive(driveId: string): Promise<SyncDriveResponse> {
  const response = await fetch(`/api/googleDrive/metadata?driveId=${driveId}`, {
    method: 'POST',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to sync drive');
  }

  return response.json();
}

export function useSyncDrive() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ driveId }: SyncDriveParams) => syncDrive(driveId),
    onSuccess: (data) => {
      toast({
        title: 'Sync Complete',
        description: data.message || 'Your drive has been synced successfully',
      });

      queryClient.invalidateQueries({ queryKey: ['connected-drives'] });
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Sync Failed',
        description: error.message || 'Failed to sync drive. Please try again.',
        variant: 'destructive',
      });
    },
  });
}
