/**
 * Pagination Types - أنواع التصفح
 * @version 2.9.10
 */

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export const DEFAULT_PAGE_SIZE = 15;
export const DEFAULT_PAGE = 1;
export const PAGE_SIZE_OPTIONS = [10, 15, 25, 50, 100];
