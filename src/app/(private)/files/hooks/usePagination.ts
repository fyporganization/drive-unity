import { useState, useMemo } from 'react';
import { UsePaginationProps, UsePaginationReturn } from '@/app/(private)/files/types/File.types';

export const usePagination = ({
  data,
  pageSize: initialPageSize = 20,
}: UsePaginationProps): UsePaginationReturn => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = useMemo(() => {
    return Math.ceil(data.length / pageSize);
  }, [data.length, pageSize]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, pageSize]);

  const startIndex = useMemo(() => {
    return (currentPage - 1) * pageSize + 1;
  }, [currentPage, pageSize]);

  const endIndex = useMemo(() => {
    return Math.min(currentPage * pageSize, data.length);
  }, [currentPage, pageSize, data.length]);

  const goToPage = (page: number) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNumber);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleSetPageSize = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  return {
    currentPage,
    totalPages,
    paginatedData,
    goToPage,
    nextPage,
    previousPage,
    canGoNext: currentPage < totalPages,
    canGoPrevious: currentPage > 1,
    setPageSize: handleSetPageSize,
    pageSize,
    startIndex,
    endIndex,
    totalItems: data.length,
  };
};