import { useQuery } from '@tanstack/react-query';
import { SmartSearchResponse } from '@/app/(private)/files/types/File.types';
import { smartSearchAction } from '@/lib/actions/drive-filters.action';
import { DriveProvider } from './useFileData';

export const useSmartSearch = (
  query: string,
  userId?: string,
  driveId?: string | null,
  provider: DriveProvider = 'google'
) => {
  return useQuery({
    queryKey: ['smartSearch', query, userId, driveId, provider],
    queryFn: async () => {
      if (!userId || !driveId) {
        return { files: [], statistics: null, suggestions: null, searchInfo: null };
      }

      if (!query || query.trim().length === 0) {
        return { files: [], statistics: null, suggestions: null, searchInfo: null };
      }

      const data = (await smartSearchAction(provider, {
        userId,
        driveId,
        query: query.trim(),
      })) as unknown as SmartSearchResponse;

      if (!data.success) {
        throw new Error(data.message || 'Failed to perform smart search');
      }

      return {
        files: data.files,
        statistics: data.statistics,
        suggestions: data.suggestions,
        searchInfo: data.searchInfo,
        query: data.query,
      };
    },
    enabled: !!userId && !!driveId && !!query && query.trim().length > 0,
    staleTime: 1000 * 60 * 2,
  });
};
