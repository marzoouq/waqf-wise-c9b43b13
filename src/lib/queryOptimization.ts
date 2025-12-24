/**
 * Query Optimization Utilities
 * Helpers for optimizing Supabase queries
 * 
 * @deprecated QUERY_CONFIG و CACHE_TIMES انتقلوا إلى @/infrastructure/react-query
 */

// إعادة تصدير من المصدر الجديد للتوافق
export { QUERY_CONFIG, CACHE_TIMES } from '@/infrastructure/react-query';

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
