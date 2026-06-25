import { useQuery } from '@tanstack/react-query';
import { DateRangeFilter, DateRangeResponse, DateRangeInfoResponse } from '@/app/(private)/files/types/File.types';
import { filterByDateRangeAction, getDateRangeAction } from '@/lib/actions/drive-filters.action';
import { DriveProvider } from './useFileData';

export const useDateRange = (
  filter: DateRangeFilter,
  userId?: string,
  driveId?: string | null,
  provider: DriveProvider = 'google'
) => {
  return useQuery({
    queryKey: ['dateRange', filter, userId, driveId, provider],
    queryFn: async () => {
      if (!userId || !driveId) {
        return {
          files: [],
          statistics: null,
          groupedByPeriod: null,
          filesByMonth: [],
          filter: { startDate: null, endDate: null, daysInRange: null },
        };
      }

      if (!filter.startDate && !filter.endDate) {
        return {
          files: [],
          statistics: null,
          groupedByPeriod: null,
          filesByMonth: [],
          filter: { startDate: null, endDate: null, daysInRange: null },
        };
      }

      const data = (await filterByDateRangeAction(provider, {
        userId,
        driveId,
        startDate: filter.startDate,
        endDate: filter.endDate,
      })) as unknown as DateRangeResponse;

      if (!data.success) {
        throw new Error(data.message || 'Failed to filter files by date range');
      }

      return {
        files: data.files,
        statistics: data.statistics,
        groupedByPeriod: data.groupedByPeriod,
        filesByMonth: data.filesByMonth,
        filter: data.filter,
      };
    },
    enabled: !!userId && !!driveId && (!!filter.startDate || !!filter.endDate),
    staleTime: 1000 * 60 * 5,
  });
};

export const useDateRangeInfo = (
  userId?: string,
  driveId?: string | null,
  provider: DriveProvider = 'google'
) => {
  return useQuery({
    queryKey: ['dateRangeInfo', userId, driveId, provider],
    queryFn: async () => {
      if (!userId || !driveId) {
        return { dateRanges: null, totalFiles: 0 };
      }

      const data = (await getDateRangeAction(provider, {
        userId,
        driveId,
      })) as unknown as DateRangeInfoResponse;

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch date range information');
      }

      return {
        dateRanges: data.dateRanges,
        totalFiles: data.totalFiles,
      };
    },
    enabled: !!userId && !!driveId,
    staleTime: 1000 * 60 * 10,
  });
};
