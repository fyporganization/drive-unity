import { useMemo } from 'react';
import { FilterState, UseFilterDataReturn, FileData } from '@/app/(private)/files/types/File.types';
import { useFileData, DriveProvider } from './useFileData';
import { useDateRange } from './useDateRange';
import { useFileSize } from './useFileSize';
import { useSmartSearch } from './useSmartSearch';

function applyMimeFilter(files: FileData[], mimeTypes?: string[]): FileData[] {
  if (!mimeTypes || mimeTypes.length === 0) return files;
  return files.filter((file) => mimeTypes.includes(file.mimeType));
}

function applySizeFilter(
  files: FileData[],
  fileSize?: { minSize?: number; maxSize?: number }
): FileData[] {
  if (!fileSize?.minSize && !fileSize?.maxSize) return files;
  return files.filter((file) => {
    const size = file.fileSize;
    if (fileSize.minSize && size < fileSize.minSize) return false;
    if (fileSize.maxSize && size > fileSize.maxSize) return false;
    return true;
  });
}

export const useFilterData = (
  userId: string | undefined,
  filters: FilterState,
  driveId: string | null | undefined,
  provider: DriveProvider = 'google'
): UseFilterDataReturn => {
  const {
    data: allFilesData,
    isLoading: isLoadingAll,
    isError: isErrorAll,
    error: errorAll,
    refetch: refetchAll,
  } = useFileData(userId, driveId, provider);

  const {
    data: dateRangeData,
    isLoading: isLoadingDate,
    isError: isErrorDate,
    error: errorDate,
  } = useDateRange(
    { startDate: filters.dateRange?.startDate, endDate: filters.dateRange?.endDate },
    userId,
    driveId,
    provider
  );

  const {
    data: fileSizeData,
    isLoading: isLoadingSize,
    isError: isErrorSize,
    error: errorSize,
  } = useFileSize(
    { minSize: filters.fileSize?.minSize, maxSize: filters.fileSize?.maxSize },
    userId,
    driveId,
    provider
  );

  const {
    data: searchData,
    isLoading: isLoadingSearch,
    isError: isErrorSearch,
    error: errorSearch,
  } = useSmartSearch(filters.searchQuery || '', userId, driveId, provider);

  const filteredFiles = useMemo(() => {
    if (filters.searchQuery && searchData?.files) {
      return searchData.files;
    }

    const hasDateFilter = filters.dateRange?.startDate || filters.dateRange?.endDate;
    if (hasDateFilter && dateRangeData?.files) {
      const withMime = applyMimeFilter(dateRangeData.files, filters.mimeTypes);
      return applySizeFilter(withMime, filters.fileSize);
    }

    const hasSizeFilter = filters.fileSize?.minSize || filters.fileSize?.maxSize;
    if (hasSizeFilter && fileSizeData?.files) {
      return applyMimeFilter(fileSizeData.files, filters.mimeTypes);
    }

    return applyMimeFilter(allFilesData?.files || [], filters.mimeTypes);
  }, [filters, allFilesData, dateRangeData, fileSizeData, searchData]);

  const isLoading = useMemo(() => {
    if (filters.searchQuery) return isLoadingSearch;
    if (filters.dateRange?.startDate || filters.dateRange?.endDate) return isLoadingDate;
    if (filters.fileSize?.minSize || filters.fileSize?.maxSize) return isLoadingSize;
    return isLoadingAll;
  }, [filters, isLoadingAll, isLoadingDate, isLoadingSize, isLoadingSearch]);

  const isError = useMemo(() => {
    if (filters.searchQuery) return isErrorSearch;
    if (filters.dateRange?.startDate || filters.dateRange?.endDate) return isErrorDate;
    if (filters.fileSize?.minSize || filters.fileSize?.maxSize) return isErrorSize;
    return isErrorAll;
  }, [filters, isErrorAll, isErrorDate, isErrorSize, isErrorSearch]);

  const error = useMemo(() => {
    if (filters.searchQuery) return errorSearch;
    if (filters.dateRange?.startDate || filters.dateRange?.endDate) return errorDate;
    if (filters.fileSize?.minSize || filters.fileSize?.maxSize) return errorSize;
    return errorAll;
  }, [filters, errorAll, errorDate, errorSize, errorSearch]);

  return {
    files: filteredFiles,
    isLoading,
    isError,
    error: error as Error | null,
    totalFiles: filteredFiles.length,
    refetch: refetchAll,
  };
};
