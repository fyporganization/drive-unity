'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  SlidersHorizontal,
  X,
  Loader2,
  FileText,
  AlertTriangle,
  FolderOpen,
} from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

import { FileList } from '@/app/(private)/files/_component/FileList';
import { FiltersModal } from '@/app/(private)/files/_component/FilterModal';
import { DeleteDuplicatesButton } from '@/app/(private)/files/_component/DeleteDuplicatesButton';
import { useFilterData } from '@/app/(private)/files/hooks/useFilterData';
import { useMimeType } from '@/app/(private)/files/hooks/useMimeType';
import { useDateRangeInfo } from '@/app/(private)/files/hooks/useDateRange';
import { usePagination } from '@/app/(private)/files/hooks/usePagination';
import { FilterState } from '@/app/(private)/files/types/File.types';
import { checkDuplicates } from './hooks/useDuplicates';
import { DriveProvider } from './hooks/useFileData';
import { useConnectedDrives } from '@/app/(private)/connections/hooks/useConnectedDrives';
import { useConnectedOneDrives } from '@/app/(private)/connections/hooks/useConnectedOneDrive';

interface ContentProps {
  userId: string;
}

const EMPTY_FILTERS: FilterState = { dateRange: {}, fileSize: {}, mimeTypes: [], searchQuery: '' };

// ── Provider icons ─────────────────────────────────────────────────────────────
const GoogleDriveIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4.5 19.5L8 13.5H20.5L17 19.5H4.5Z" fill="#0066DA" />
    <path d="M8 13.5L3.5 5.5H10L14.5 13.5H8Z" fill="#00AC47" />
    <path d="M14.5 13.5L10 5.5H16.5L21 13.5H14.5Z" fill="#FFBA00" />
  </svg>
);

const OneDriveIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.5 14.5H18.5C19.88 14.5 21 13.38 21 12C21 10.74 20.1 9.7 18.9 9.52C18.96 9.18 19 8.84 19 8.5C19 6.01 16.99 4 14.5 4C13.07 4 11.8 4.65 10.95 5.67C10.48 5.25 9.87 5 9.2 5C7.76 5 6.57 6.07 6.41 7.46C4.5 7.83 3 9.55 3 11.5C3 13.16 4.01 14.59 5.44 15.2C5.95 14.78 6.69 14.5 7.5 14.5H9.5Z" fill="#0364B8" />
    <path d="M5 16C4.17 16 3.46 16.49 3.15 17.19C3.06 17.12 3 17.01 3 16.9V16.5C3 15.67 3.67 15 4.5 15H19.5C20.33 15 21 15.67 21 16.5V16.9C21 17.01 20.94 17.12 20.85 17.19C20.54 16.49 19.83 16 19 16H5Z" fill="#0078D4" />
    <rect x="3" y="17" width="18" height="4" rx="1.5" fill="#1490DF" />
  </svg>
);

// ── Helpers ────────────────────────────────────────────────────────────────────

function driveLabel(drive: any): string {
  return (
    drive.gmailAccount ??
    drive.onedriveAccount ??
    drive.email ??
    drive.accountEmail ??
    drive.displayName ??
    drive.id
  );
}

function firstDriveId(drives: any[]): string | null {
  return drives.length > 0 ? drives[0].id : null;
}

function countActiveFilters(filters: FilterState, showDuplicatesOnly: boolean): number {
  let count = 0;
  if (filters.dateRange?.startDate || filters.dateRange?.endDate) count++;
  if (filters.fileSize?.minSize || filters.fileSize?.maxSize) count++;
  count += filters.mimeTypes?.length || 0;
  if (showDuplicatesOnly) count++;
  return count;
}

function computeDuplicateInfo(duplicateData: any, files: any[]) {
  if (!duplicateData?.data || !duplicateData?.duplicateGroups) {
    return { duplicateChecksums: new Set<string>(), duplicateFiles: [] as any[], duplicateCount: 0, duplicateGroups: 0 };
  }
  const duplicateFileIds = new Set(duplicateData.data.map((f: any) => f.id));
  const duplicateFiles = files.filter((f: any) => duplicateFileIds.has(f.id));
  const duplicateChecksums = new Set(duplicateData.duplicateGroups.map((g: any) => g.md5Checksum));
  return {
    duplicateChecksums,
    duplicateFiles,
    duplicateCount: duplicateData.count,
    duplicateGroups: duplicateData.duplicateGroups.length,
  };
}

function toMimeOptions(mimeTypeData: any) {
  return mimeTypeData?.mimeTypes?.map((mt: any) => ({
    value: mt.value, label: mt.label, category: mt.category,
  })) || [];
}

type DuplicateInfo = ReturnType<typeof computeDuplicateInfo>;

// ── Hooks ──────────────────────────────────────────────────────────────────────

function useDriveSelection() {
  const [selectedDriveId, setSelectedDriveId] = useState<string | null>(null);
  const [driveProvider, setDriveProvider] = useState<DriveProvider>('google');

  const { data: googleDrivesData, isLoading: isGoogleLoading } = useConnectedDrives();
  const { data: oneDrivesData, isLoading: isOnedriveLoading } = useConnectedOneDrives();
  const isDrivesLoading = isGoogleLoading || isOnedriveLoading;

  const googleDrives = useMemo(() => googleDrivesData?.drives ?? [], [googleDrivesData]);
  const oneDrives = useMemo(() => oneDrivesData?.drives ?? [], [oneDrivesData]);

  const hasOneDrive = oneDrives.length > 0;
  const currentDrives = driveProvider === 'onedrive' ? oneDrives : googleDrives;

  // Auto-select first drive on initial load only
  useEffect(() => {
    if (currentDrives.length > 0 && !selectedDriveId) {
      setSelectedDriveId(currentDrives[0].id);
    }
  }, [currentDrives, selectedDriveId]);

  // Guard: ensure selectedDriveId belongs to the current provider's drives before
  // passing it to any API hook — the last line of defence against cross-provider 404s.
  const safeSelectedDriveId = useMemo(() => {
    if (!selectedDriveId) return null;
    return currentDrives.some((d: any) => d.id === selectedDriveId) ? selectedDriveId : null;
  }, [selectedDriveId, currentDrives]);

  return {
    selectedDriveId,
    setSelectedDriveId,
    driveProvider,
    setDriveProvider,
    googleDrives,
    oneDrives,
    hasOneDrive,
    currentDrives,
    safeSelectedDriveId,
    isDrivesLoading,
  };
}

function useFileFilters() {
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [tempFilters, setTempFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [showDuplicatesOnly, setShowDuplicatesOnly] = useState(false);
  const [filtersModalOpened, setFiltersModalOpened] = useState(false);

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = (value: string) =>
    setTempFilters((p) => ({ ...p, searchQuery: value }));

  // Debounced search
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setFilters((p) => ({ ...p, searchQuery: tempFilters.searchQuery }));
    }, 350);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [tempFilters.searchQuery]);

  const handleApplyFilters = () => {
    setFilters(tempFilters);
    setFiltersModalOpened(false);
  };

  const handleClearFilters = () => {
    setTempFilters(EMPTY_FILTERS);
    setFilters(EMPTY_FILTERS);
    setShowDuplicatesOnly(false);
  };

  const clearSearch = () => {
    setTempFilters((p) => ({ ...p, searchQuery: '' }));
    setFilters((p) => ({ ...p, searchQuery: '' }));
  };

  return {
    filters,
    tempFilters,
    setTempFilters,
    showDuplicatesOnly,
    setShowDuplicatesOnly,
    filtersModalOpened,
    setFiltersModalOpened,
    handleSearchChange,
    handleApplyFilters,
    handleClearFilters,
    clearSearch,
  };
}

// ── Component ──────────────────────────────────────────────────────────────────
export const Content: React.FC<ContentProps> = ({ userId }) => {
  const sel = useDriveSelection();
  const flt = useFileFilters();

  const { files, isLoading, isError, error, totalFiles } = useFilterData(
    userId, flt.filters, sel.safeSelectedDriveId, sel.driveProvider
  );
  const { data: duplicateData, isLoading: isDuplicatesLoading } = checkDuplicates(
    userId, sel.safeSelectedDriveId, sel.driveProvider
  );
  const { data: mimeTypeData, isLoading: isMimeTypeLoading } = useMimeType(
    userId, sel.safeSelectedDriveId, sel.driveProvider
  );
  const { data: dateRangeInfo } = useDateRangeInfo(userId, sel.safeSelectedDriveId, sel.driveProvider);

  const duplicateInfo = useMemo(
    () => computeDuplicateInfo(duplicateData, files),
    [duplicateData, files]
  );
  const displayFiles = flt.showDuplicatesOnly ? duplicateInfo.duplicateFiles : files;

  const { paginatedData, currentPage, totalPages, goToPage, startIndex, endIndex, totalItems } =
    usePagination({ data: displayFiles, pageSize: 20 });

  useEffect(() => {
    goToPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flt.filters, flt.showDuplicatesOnly, sel.selectedDriveId]);

  const mimeTypeOptions = toMimeOptions(mimeTypeData);
  const activeFiltersCount = countActiveFilters(flt.filters, flt.showDuplicatesOnly);

  const handleProviderSwitch = (p: DriveProvider) => {
    if (p === sel.driveProvider) return;
    if (p === 'onedrive' && !sel.hasOneDrive) return;

    // Set provider AND selectedDriveId together so hooks never get a mismatched pair.
    const targetDrives = p === 'onedrive' ? sel.oneDrives : sel.googleDrives;
    sel.setDriveProvider(p);
    sel.setSelectedDriveId(firstDriveId(targetDrives));
    flt.handleClearFilters();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 md:p-8 lg:p-10 space-y-8 max-w-6xl">
      <FilesHeader
        totalFiles={totalFiles}
        duplicateInfo={duplicateInfo}
        isDuplicatesLoading={isDuplicatesLoading}
      />

      {!sel.isDrivesLoading && (
        <ProviderAccountSelector
          driveProvider={sel.driveProvider}
          hasOneDrive={sel.hasOneDrive}
          currentDrives={sel.currentDrives}
          selectedDriveId={sel.selectedDriveId}
          onSwitchProvider={handleProviderSwitch}
          onSelectDrive={sel.setSelectedDriveId}
        />
      )}

      <DuplicateAlert duplicateInfo={duplicateInfo} isDuplicatesLoading={isDuplicatesLoading} />

      <SearchFilterBar
        searchQuery={flt.tempFilters.searchQuery}
        onSearchChange={flt.handleSearchChange}
        onClearSearch={flt.clearSearch}
        onOpenFilters={() => flt.setFiltersModalOpened(true)}
        activeFiltersCount={activeFiltersCount}
      />

      <FiltersModal
        opened={flt.filtersModalOpened}
        onClose={() => flt.setFiltersModalOpened(false)}
        filters={flt.tempFilters}
        onFiltersChange={flt.setTempFilters}
        onApplyFilters={flt.handleApplyFilters}
        onClearFilters={flt.handleClearFilters}
        mimeTypeOptions={mimeTypeOptions}
        isMimeTypeLoading={isMimeTypeLoading}
        dateRangeInfo={dateRangeInfo}
        showDuplicatesOnly={flt.showDuplicatesOnly}
        onShowDuplicatesChange={flt.setShowDuplicatesOnly}
        duplicateInfo={duplicateInfo}
        isDuplicatesLoading={isDuplicatesLoading}
      />

      <FilesResult
        isLoading={isLoading}
        isError={isError}
        error={error}
        displayFiles={displayFiles}
        paginatedData={paginatedData}
        activeFiltersCount={activeFiltersCount}
        filters={flt.filters}
        selectedDriveId={sel.selectedDriveId}
        driveProvider={sel.driveProvider}
        onClearFilters={flt.handleClearFilters}
        showDuplicatesOnly={flt.showDuplicatesOnly}
        startIndex={startIndex}
        endIndex={endIndex}
        totalItems={totalItems}
        currentPage={currentPage}
        totalPages={totalPages}
        goToPage={goToPage}
        duplicateBytes={Number(duplicateData?.totalSavingsBytes ?? 0)}
      />
    </motion.div>
  );
};

// ── Header ───────────────────────────────────────────────────────────────────

function FilesHeader({ totalFiles, duplicateInfo, isDuplicatesLoading }: Readonly<{
  totalFiles: number;
  duplicateInfo: DuplicateInfo;
  isDuplicatesLoading: boolean;
}>) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-2xl font-display font-bold text-foreground">My Files</h1>
        <Badge variant="secondary" className="text-xs">{totalFiles} files</Badge>
        {!isDuplicatesLoading && duplicateInfo.duplicateCount > 0 && (
          <Badge variant="secondary" className="text-xs bg-amber-50 text-amber-700 border-amber-200/60">
            {duplicateInfo.duplicateGroups} duplicate groups
          </Badge>
        )}
      </div>
    </motion.div>
  );
}

// ── Provider + Account selector ──────────────────────────────────────────────

function ProviderAccountSelector({
  driveProvider,
  hasOneDrive,
  currentDrives,
  selectedDriveId,
  onSwitchProvider,
  onSelectDrive,
}: Readonly<{
  driveProvider: DriveProvider;
  hasOneDrive: boolean;
  currentDrives: any[];
  selectedDriveId: string | null;
  onSwitchProvider: (p: DriveProvider) => void;
  onSelectDrive: (id: string) => void;
}>) {
  const googleClass = driveProvider === 'google'
    ? 'bg-background text-foreground shadow-sm border border-border/50'
    : 'text-muted-foreground hover:text-foreground hover:bg-background/60';

  let oneDriveClass = 'text-muted-foreground hover:text-foreground hover:bg-background/60';
  if (driveProvider === 'onedrive') {
    oneDriveClass = 'bg-background text-foreground shadow-sm border border-border/50';
  } else if (!hasOneDrive) {
    oneDriveClass = 'text-muted-foreground/40 cursor-not-allowed';
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
      <Card className="rounded-xl border-border/50 shadow-soft">
        <CardContent className="p-4 space-y-3">

          {/* Provider toggle */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-muted-foreground shrink-0">Storage</span>
            <div className="flex gap-1 p-1 rounded-lg bg-muted/50 border border-border/40">
              <button
                onClick={() => onSwitchProvider('google')}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md font-medium transition-all duration-150 ${googleClass}`}
              >
                <GoogleDriveIcon />
                Google Drive
              </button>

              <button
                onClick={() => onSwitchProvider('onedrive')}
                disabled={!hasOneDrive}
                title={!hasOneDrive ? 'No OneDrive account connected. Go to Connections to add one.' : undefined}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md font-medium transition-all duration-150 ${oneDriveClass}`}
              >
                <OneDriveIcon />
                OneDrive
                {!hasOneDrive && (
                  <span className="text-[10px] bg-muted/80 text-muted-foreground/60 px-1.5 py-0.5 rounded-full">
                    Not connected
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Account selector */}
          {currentDrives.length > 0 && (
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
                <div className="w-5 h-5 rounded bg-accent flex items-center justify-center">
                  <FileText className="w-3 h-3 text-primary" />
                </div>
                {driveProvider === 'onedrive' ? 'OneDrive Account' : 'Drive Account'}
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {currentDrives.map((drive: any) => (
                  <button
                    key={drive.id}
                    onClick={() => onSelectDrive(drive.id)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                      selectedDriveId === drive.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {driveLabel(drive)}
                  </button>
                ))}
              </div>
            </div>
          )}

        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Duplicate alert ──────────────────────────────────────────────────────────

function DuplicateAlert({ duplicateInfo, isDuplicatesLoading }: Readonly<{
  duplicateInfo: DuplicateInfo;
  isDuplicatesLoading: boolean;
}>) {
  if (isDuplicatesLoading || duplicateInfo.duplicateCount === 0) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
      <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200/60 text-amber-800">
        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium">Duplicate Files Detected</p>
          <p className="text-xs mt-0.5 text-amber-700">
            {duplicateInfo.duplicateGroups} groups with {duplicateInfo.duplicateCount} duplicate files found.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ── Search & filter bar ──────────────────────────────────────────────────────

function SearchFilterBar({ searchQuery, onSearchChange, onClearSearch, onOpenFilters, activeFiltersCount }: Readonly<{
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  onOpenFilters: () => void;
  activeFiltersCount: number;
}>) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
      <Card className="rounded-xl border-border/50 shadow-soft">
        <CardContent className="p-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search files..."
                className="pl-10 h-11 rounded-xl border-border/50"
              />
              {searchQuery && (
                <button
                  onClick={onClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>
            <Button variant="outline" onClick={onOpenFilters} className="h-11 rounded-xl gap-2 relative">
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Result (loading / error / empty / table) ─────────────────────────────────

function FilesResult(props: Readonly<{
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  displayFiles: any[];
  paginatedData: any[];
  activeFiltersCount: number;
  filters: FilterState;
  selectedDriveId: string | null;
  driveProvider: DriveProvider;
  onClearFilters: () => void;
  showDuplicatesOnly: boolean;
  startIndex: number;
  endIndex: number;
  totalItems: number;
  currentPage: number;
  totalPages: number;
  goToPage: (page: number) => void;
  duplicateBytes: number;
}>) {
  if (props.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading your files...</p>
      </div>
    );
  }

  if (props.isError) {
    return (
      <Card className="rounded-xl border-destructive/20">
        <CardContent className="p-6 text-center">
          <p className="text-sm text-destructive font-medium">
            {props.error?.message || 'Failed to load files. Please try again.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (props.displayFiles.length === 0) {
    return (
      <FilesEmptyState
        activeFiltersCount={props.activeFiltersCount}
        filters={props.filters}
        selectedDriveId={props.selectedDriveId}
        driveProvider={props.driveProvider}
        onClearFilters={props.onClearFilters}
      />
    );
  }

  return (
    <FilesTable
      paginatedData={props.paginatedData}
      showDuplicatesOnly={props.showDuplicatesOnly}
      startIndex={props.startIndex}
      endIndex={props.endIndex}
      totalItems={props.totalItems}
      currentPage={props.currentPage}
      totalPages={props.totalPages}
      goToPage={props.goToPage}
      driveProvider={props.driveProvider}
      selectedDriveId={props.selectedDriveId}
      duplicateBytes={props.duplicateBytes}
    />
  );
}

function FilesEmptyState({ activeFiltersCount, filters, selectedDriveId, driveProvider, onClearFilters }: Readonly<{
  activeFiltersCount: number;
  filters: FilterState;
  selectedDriveId: string | null;
  driveProvider: DriveProvider;
  onClearFilters: () => void;
}>) {
  const hasFilters = activeFiltersCount > 0 || !!filters.searchQuery;
  const providerName = driveProvider === 'onedrive' ? 'OneDrive' : 'Google Drive';

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="rounded-xl border-border/50 shadow-soft">
        <CardContent className="p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            {hasFilters
              ? <Search className="w-8 h-8 text-muted-foreground" />
              : <FolderOpen className="w-8 h-8 text-muted-foreground" />}
          </div>

          {hasFilters && (
            <>
              <h3 className="text-lg font-display font-semibold text-foreground mb-1">
                No files match your filters
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Try adjusting your search or clearing the active filters.
              </p>
              <Button variant="outline" onClick={onClearFilters} className="gap-2">
                <X className="w-4 h-4" />
                Clear Filters
              </Button>
            </>
          )}

          {!hasFilters && !selectedDriveId && (
            <>
              <h3 className="text-lg font-display font-semibold text-foreground mb-1">
                No account selected
              </h3>
              <p className="text-sm text-muted-foreground">
                Select a {providerName} account above to view your files.
              </p>
            </>
          )}

          {!hasFilters && selectedDriveId && (
            <>
              <h3 className="text-lg font-display font-semibold text-foreground mb-1">
                No files found
              </h3>
              <p className="text-sm text-muted-foreground">
                {driveProvider === 'onedrive'
                  ? "This OneDrive account has no files, or the drive hasn't been synced yet."
                  : 'This Google Drive account appears to be empty.'}
              </p>
              {driveProvider === 'onedrive' && (
                <p className="text-xs text-muted-foreground mt-2">
                  Try syncing the drive from the{' '}
                  <span className="font-medium text-foreground">Connections</span> page first.
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function FilesTable({ paginatedData, showDuplicatesOnly, startIndex, endIndex, totalItems, currentPage, totalPages, goToPage, driveProvider, selectedDriveId, duplicateBytes }: Readonly<{
  paginatedData: any[];
  showDuplicatesOnly: boolean;
  startIndex: number;
  endIndex: number;
  totalItems: number;
  currentPage: number;
  totalPages: number;
  goToPage: (page: number) => void;
  driveProvider: DriveProvider;
  selectedDriveId: string | null;
  duplicateBytes: number;
}>) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <Badge variant="secondary" className="text-xs">
          Showing {startIndex} – {endIndex} of {totalItems} files
          {showDuplicatesOnly && ' (duplicates only)'}
        </Badge>
        {showDuplicatesOnly ? (
          <DeleteDuplicatesButton
            provider={driveProvider}
            driveId={selectedDriveId}
            duplicateCount={totalItems}
            totalBytes={duplicateBytes}
          />
        ) : null}
      </div>

      <FileList files={paginatedData} />

      {totalPages > 1 && (
        <div className="flex items-center justify-center mt-6">
          <Pagination
            value={currentPage}
            onChange={goToPage}
            total={totalPages}
            siblings={1}
            boundaries={1}
          />
        </div>
      )}
    </motion.div>
  );
}
