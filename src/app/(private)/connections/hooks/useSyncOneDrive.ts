import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface SyncOneDriveParams {
  driveId: string;
}

interface SyncOneDriveResponse {
  status: string;
  message: string;
}

async function syncOneDrive(driveId: string): Promise<SyncOneDriveResponse> {
  const response = await fetch(`/api/onedrive/metadata?driveId=${driveId}`, {
    method: 'POST',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to sync OneDrive');
  }

  return response.json();
}

export function useSyncOneDrive() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ driveId }: SyncOneDriveParams) => syncOneDrive(driveId),
    onSuccess: (data) => {
      toast({
        title: 'Sync Complete',
        description: data.message || 'Your OneDrive has been synced successfully',
      });

      queryClient.invalidateQueries({ queryKey: ['connected-onedrives'] });
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Sync Failed',
        description: error.message || 'Failed to sync OneDrive. Please try again.',
        variant: 'destructive',
      });
    },
  });
}
