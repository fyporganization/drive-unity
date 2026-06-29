import { useQuery } from '@tanstack/react-query';
import { FileDataResponse } from '@/app/(private)/files/types/File.types';

export type DriveProvider = 'google' | 'onedrive';

const getBaseUrl = (provider: DriveProvider) =>
  provider === 'onedrive' ? '/api/onedrive' : '/api/googleDrive';

export const useFileData = (
  userId?: string,
  driveId?: string | null,
  provider: DriveProvider = 'google'
) => {
  return useQuery({
    queryKey: ['fileData', userId, driveId, provider],
    queryFn: async () => {
      if (!userId) {
        throw new Error('User ID is required');
      }

      if (!driveId) {
        return {
          files: [],
          total: 0,
        };
      }

      const base = getBaseUrl(provider);
      const response = await fetch(
        `${base}/fileManagement?driveId=${driveId}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch file data');
      }

      const data: FileDataResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch file data');
      }

      return {
        files: data.fileData,
        total: data.fileData.length,
      };
    },
    enabled: !!userId && !!driveId,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
  });
};
