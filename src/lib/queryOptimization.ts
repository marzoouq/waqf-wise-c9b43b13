/**
 * Query Optimization Utilities
 * Helpers for optimizing Supabase queries
 */

/**
 * Creates optimized select query for related tables
 * Only fetches needed fields to reduce payload size
 */
export const createOptimizedSelect = (fields: Record<string, string[]>): string => {
  return Object.entries(fields)
    .map(([table, columns]) => 
      table === 'main' 
        ? columns.join(', ')
        : `${table}(${columns.join(', ')})`
    )
    .join(', ');
};

/**
 * Standard pagination settings
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  LARGE_PAGE_SIZE: 50,
  SMALL_PAGE_SIZE: 5,
} as const;

/**
 * Cache times for different data types
 */
export const CACHE_TIMES = {
  STATIC: 60 * 60 * 1000,      // 1 hour - for rarely changing data
  STANDARD: 5 * 60 * 1000,     // 5 minutes - for standard data
  DYNAMIC: 1 * 60 * 1000,      // 1 minute - for frequently changing data
  REALTIME: 0,                 // No cache - for real-time data
} as const;

/**
 * Creates date range filter for queries
 */
export const createDateRangeFilter = (days: number) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return {
    start: startDate.toISOString().split('T')[0],
    end: endDate.toISOString().split('T')[0],
  };
};

/**
 * Formats large numbers for display
 */
export const formatLargeNumber = (num: number): string => {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}م`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}ألف`;
  }
  return num.toString();
};
