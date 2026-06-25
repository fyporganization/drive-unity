import { useQuery } from '@tanstack/react-query';
import { FileSizeFilter, FileSizeResponse } from '@/app/(private)/files/types/File.types';
import { filterByFileSizeAction } from '@/lib/actions/drive-filters.action';
import { DriveProvider } from './useFileData';

export const useFileSize = (
  filter?: FileSizeFilter,
  userId?: string,
  driveId?: string | null,
  provider: DriveProvider = 'google'
) => {
  return useQuery({
    queryKey: ['fileSize', filter, userId, driveId, provider],
    queryFn: async () => {
      if (!userId || !driveId) {
        return { files: [], statistics: null, sizeDistribution: null, filter: null };
      }

      const data = (await filterByFileSizeAction(provider, {
        userId,
        driveId,
        minSize: filter?.minSize,
        maxSize: filter?.maxSize,
      })) as unknown as FileSizeResponse;

      if (!data.success) {
        throw new Error(data.message || 'Failed to filter files by size');
      }

      return {
        files: data.files,
        statistics: data.statistics,
        sizeDistribution: data.sizeDistribution,
        filter: data.filter,
      };
    },
    enabled: !!userId && !!driveId && (!!filter?.minSize || !!filter?.maxSize),
    staleTime: 1000 * 60 * 5,
  });
};
