/**
 * usePagination Hook - التصفح بالصفحات
 * @version 2.9.9
 */
import { useState, useMemo, useCallback } from "react";

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  pageSizeOptions?: number[];
}

export interface UsePaginationReturn<T> {
  // البيانات
  paginatedData: T[];
  pagination: PaginationState;
  
  // التنقل
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
  
  // الإعدادات
  setPageSize: (size: number) => void;
  pageSizeOptions: number[];
  
  // الحالة
  canGoNext: boolean;
  canGoPrev: boolean;
  startIndex: number;
  endIndex: number;
}

export function usePagination<T>(
  data: T[],
  options: UsePaginationOptions = {}
): UsePaginationReturn<T> {
  const {
    initialPage = 1,
    initialPageSize = 15,
    pageSizeOptions = [10, 15, 25, 50, 100],
  } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  // إعادة ضبط الصفحة إذا تجاوزت الحد
  const validCurrentPage = useMemo(() => {
    if (currentPage > totalPages && totalPages > 0) {
      return totalPages;
    }
    if (currentPage < 1) {
      return 1;
    }
    return currentPage;
  }, [currentPage, totalPages]);

  // حساب البيانات المعروضة
  const paginatedData = useMemo(() => {
    const start = (validCurrentPage - 1) * pageSize;
    const end = start + pageSize;
    return data.slice(start, end);
  }, [data, validCurrentPage, pageSize]);

  // حساب الفهارس
  const startIndex = (validCurrentPage - 1) * pageSize + 1;
  const endIndex = Math.min(validCurrentPage * pageSize, totalItems);

  // التنقل
  const goToPage = useCallback((page: number) => {
    const targetPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(targetPage);
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (validCurrentPage < totalPages) {
      setCurrentPage(validCurrentPage + 1);
    }
  }, [validCurrentPage, totalPages]);

  const prevPage = useCallback(() => {
    if (validCurrentPage > 1) {
      setCurrentPage(validCurrentPage - 1);
    }
  }, [validCurrentPage]);

  const firstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const lastPage = useCallback(() => {
    setCurrentPage(totalPages);
  }, [totalPages]);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setCurrentPage(1); // إعادة للصفحة الأولى عند تغيير الحجم
  }, []);

  return {
    paginatedData,
    pagination: {
      currentPage: validCurrentPage,
      pageSize,
      totalItems,
      totalPages,
    },
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    setPageSize,
    pageSizeOptions,
    canGoNext: validCurrentPage < totalPages,
    canGoPrev: validCurrentPage > 1,
    startIndex: totalItems > 0 ? startIndex : 0,
    endIndex,
  };
}

/**
 * Hook للتصفح من السيرفر (Server-side pagination)
 */
export interface UseServerPaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  totalItems: number;
  pageSizeOptions?: number[];
}

export function useServerPagination(options: UseServerPaginationOptions) {
  const {
    initialPage = 1,
    initialPageSize = 15,
    totalItems,
    pageSizeOptions = [10, 15, 25, 50, 100],
  } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const totalPages = Math.ceil(totalItems / pageSize);

  const offset = (currentPage - 1) * pageSize;
  const startIndex = totalItems > 0 ? offset + 1 : 0;
  const endIndex = Math.min(offset + pageSize, totalItems);

  const goToPage = useCallback((page: number) => {
    const targetPage = Math.max(1, Math.min(page, totalPages || 1));
    setCurrentPage(targetPage);
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, totalPages]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage]);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setCurrentPage(1);
  }, []);

  return {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    offset,
    limit: pageSize,
    goToPage,
    nextPage,
    prevPage,
    setPageSize,
    pageSizeOptions,
    canGoNext: currentPage < totalPages,
    canGoPrev: currentPage > 1,
    startIndex,
    endIndex,
  };
}
