export interface FileData {
  id: string;
  fileId?: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  fileCreatedTime: Date | string;
  viewed_by_me_time?: Date | string | null;
  filePath?: string | null;
  web_view_link?: string | null;
  webViewLink?: string | null;
  thumbnail_link?: string | null;
  md5Checksum?: string | null;
  userId?: string;
  updatedAt?: Date | string;
}

export interface FileStatistics {
  totalFiles: number;
  totalSize: number;
  totalSizeFormatted: string;
  averageSize: number;
  averageSizeFormatted: string;
  oldestFile?: {
    date: string;
    formatted: string;
  } | null;
  newestFile?: {
    date: string;
    formatted: string;
  } | null;
  largestFile?: {
    name: string;
    size: number;
    sizeFormatted: string;
  } | null;
  smallestFile?: {
    name: string;
    size: number;
    sizeFormatted: string;
  } | null;
}

export interface DateRangeFilter {
  startDate?: string;
  endDate?: string;
}

export interface FileSizeFilter {
  minSize?: number;
  maxSize?: number;
}

export interface MimeTypeOption {
  value: string;
  label: string;
  category: string;
}

export interface FileResponse {
  success: boolean;
  count: number;
  files: FileData[];
  statistics?: FileStatistics;
  message?: string;
}

export type ViewMode = 'card' | 'table';

export interface FilterState {
  dateRange: DateRangeFilter;
  fileSize: FileSizeFilter;
  mimeTypes: string[];
  searchQuery: string;
}

export interface SmartSearchResponse {
  success: boolean;
  query: string;
  count: number;
  files: FileData[];
  suggestions: string[] | null;
  statistics: FileStatistics;
  searchInfo: {
    searchTerms: string[];
    matchedTerms: number;
    hasExactMatch: boolean;
    topScore: number;
  };
  message?: string;
}

export interface SearchSuggestionsResponse {
  success: boolean;
  suggestions: string[];
  fileExtensions: string[];
  mimeTypes: string[];
  totalFiles: number;
  message?: string;
}

export interface UsePaginationProps {
  data: FileData[];
  pageSize?: number;
}

export interface UsePaginationReturn {
  currentPage: number;
  totalPages: number;
  paginatedData: FileData[];
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  setPageSize: (size: number) => void;
  pageSize: number;
  startIndex: number;
  endIndex: number;
  totalItems: number;
}

export interface MimeTypeResponse {
  success: boolean;
  mimeTypes: MimeTypeOption[];
  groupedByCategory: Record<string, MimeTypeOption[]>;
  totalTypes: number;
  message?: string;
}

export interface UseFilterDataReturn {
  files: FileData[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  totalFiles: number;
  refetch: () => void;
}

export interface FileSizeResponse {
  success: boolean;
  count: number;
  files: FileData[];
  filter: {
    minSize: number | null;
    maxSize: number | null;
    minSizeFormatted: string | null;
    maxSizeFormatted: string | null;
  };
  statistics: FileStatistics;
  sizeDistribution: {
    tiny: number;
    small: number;
    medium: number;
    large: number;
    huge: number;
  };
  message?: string;
}

export interface FileSizeStatsResponse {
  success: boolean;
  statistics: FileStatistics;
  commonSizeRanges: {
    tiny: { max: number; label: string };
    small: { min: number; max: number; label: string };
    medium: { min: number; max: number; label: string };
    large: { min: number; max: number; label: string };
    huge: { min: number; label: string };
  };
}

export interface FileDataResponse {
  success: boolean;
  fileData: FileData[];
  error?: string;
}

export interface DuplicateGroup {
  md5Checksum: string;
  count: number;
  files: FileData[];
}

export interface DuplicateResponse {
  success: boolean;
  data: FileData[];
  count: number;
  duplicateGroups: DuplicateGroup[];
  totalSavingsBytes?: number;
  totalSavingsGB?: number;
}

export interface DateRangeResponse {
  success: boolean;
  count: number;
  files: FileData[];
  filter: {
    startDate: string | null;
    endDate: string | null;
    daysInRange: number | null;
  };
  statistics: FileStatistics;
  groupedByPeriod: {
    today: number;
    yesterday: number;
    lastWeek: number;
    lastMonth: number;
    older: number;
  };
  filesByMonth: Array<{
    month: string;
    count: number;
    totalSize: number;
  }>;
  message?: string;
}

export interface DateRangeInfoResponse {
  success: boolean;
  dateRanges: {
    oldest: string;
    newest: string;
    oldestFormatted: string;
    newestFormatted: string;
  } | null;
  totalFiles: number;
  message?: string;
}

export interface FileCardProps {
  file: FileData;
  onClick?: () => void;
}

export interface FiltersModalProps {
  opened: boolean;
  onClose: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  mimeTypeOptions: Array<{ value: string; label: string; category: string }>;
  isMimeTypeLoading: boolean;
  dateRangeInfo?: {
    dateRanges: {
      oldest: string;
      newest: string;
    } | null;
  } | null;
}