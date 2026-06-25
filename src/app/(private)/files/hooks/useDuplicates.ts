import { useQuery } from '@tanstack/react-query';
import { DuplicateResponse } from '@/app/(private)/files/types/File.types';
import { findDuplicatesAction } from '@/lib/actions/drive-filters.action';
import { DriveProvider } from './useFileData';

export const checkDuplicates = (
  userId?: string,
  driveId?: string | null,
  provider: DriveProvider = 'google'
) => {
  return useQuery({
    queryKey: ['duplicates', userId, driveId, provider],
    queryFn: async (): Promise<DuplicateResponse> => {
      if (!userId || !driveId) {
        return { success: true, data: [], count: 0, duplicateGroups: [] };
      }

      const data = await findDuplicatesAction(provider, { userId, driveId });

      if (!data.success) {
        throw new Error('Failed to fetch duplicate files!');
      }

      return data;
    },
    enabled: !!userId && !!driveId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
