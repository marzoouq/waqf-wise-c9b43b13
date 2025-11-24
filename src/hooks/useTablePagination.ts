import { useState, useMemo, useCallback } from "react";

export interface PaginationConfig {
  initialPage?: number;
  initialPageSize?: number;
  pageSizeOptions?: number[];
}

export interface PaginationResult<T> {
  // البيانات المقسّمة
  paginatedData: T[];
  
  // معلومات الصفحة الحالية
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  
  // معلومات العرض
  startIndex: number;
  endIndex: number;
  
  // دوال التحكم
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  
  // حالة الأزرار
  canGoNext: boolean;
  canGoPrevious: boolean;
}

/**
 * Custom Hook لإدارة تقسيم البيانات إلى صفحات (Pagination)
 * 
 * @template T - نوع البيانات
 * @param data - مصفوفة البيانات الكاملة
 * @param config - إعدادات التقسيم
 * @returns كائن يحتوي على البيانات المقسّمة ودوال التحكم
 */
export function useTablePagination<T>(
  data: T[],
  config: PaginationConfig = {}
): PaginationResult<T> {
  const {
    initialPage = 1,
    initialPageSize = 10,
  } = config;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  // حساب البيانات للصفحة الحالية
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, pageSize]);

  // حساب الفهارس
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  // حالة الأزرار
  const canGoNext = currentPage < totalPages;
  const canGoPrevious = currentPage > 1;

  // دوال التحكم
  const setPage = useCallback((page: number) => {
    const newPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(newPage);
  }, [totalPages]);

  const handleSetPageSize = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1); // إعادة تعيين للصفحة الأولى عند تغيير حجم الصفحة
  }, []);

  const nextPage = useCallback(() => {
    if (canGoNext) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [canGoNext]);

  const previousPage = useCallback(() => {
    if (canGoPrevious) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [canGoPrevious]);

  const goToFirstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const goToLastPage = useCallback(() => {
    setCurrentPage(totalPages);
  }, [totalPages]);

  return {
    paginatedData,
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
    setPage,
    setPageSize: handleSetPageSize,
    nextPage,
    previousPage,
    goToFirstPage,
    goToLastPage,
    canGoNext,
    canGoPrevious,
  };
}
