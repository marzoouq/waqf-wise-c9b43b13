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
 * Cache times for different data types (in milliseconds)
 */
export const CACHE_TIMES = {
  STATIC: 60 * 60 * 1000,      // 1 hour - for rarely changing data
  STANDARD: 5 * 60 * 1000,     // 5 minutes - for standard data
  DYNAMIC: 1 * 60 * 1000,      // 1 minute - for frequently changing data
  REALTIME: 0,                 // No cache - for real-time data
} as const;

/**
 * Query configuration presets
 */
export const QUERY_CONFIG = {
  DASHBOARD_KPIS: {
    staleTime: CACHE_TIMES.STANDARD,
    gcTime: CACHE_TIMES.STANDARD * 2, // Changed from cacheTime to gcTime (React Query v5)
    refetchInterval: 30000, // 30 seconds
    refetchOnWindowFocus: true,
    retry: 2,
  },
  ADMIN_KPIS: {
    staleTime: CACHE_TIMES.STANDARD,
    gcTime: CACHE_TIMES.STANDARD * 2, // Changed from cacheTime to gcTime (React Query v5)
    refetchInterval: 30000, // 30 seconds
    refetchOnWindowFocus: true,
    retry: 2,
  },
  APPROVALS: {
    staleTime: CACHE_TIMES.DYNAMIC,
    gcTime: CACHE_TIMES.DYNAMIC * 2, // Changed from cacheTime to gcTime (React Query v5)
    refetchInterval: 10000, // 10 seconds
    refetchOnWindowFocus: true,
    retry: 2,
  },
  ALERTS: {
    staleTime: CACHE_TIMES.DYNAMIC,
    gcTime: CACHE_TIMES.DYNAMIC * 2, // Changed from cacheTime to gcTime (React Query v5)
    refetchInterval: 15000, // 15 seconds
    refetchOnWindowFocus: true,
    retry: 2,
  },
  CHARTS: {
    staleTime: CACHE_TIMES.STANDARD,
    gcTime: CACHE_TIMES.STANDARD * 2, // Changed from cacheTime to gcTime (React Query v5)
    refetchInterval: 60000, // 1 minute
    refetchOnWindowFocus: false,
    retry: 1,
  },
  ACTIVITIES: {
    staleTime: CACHE_TIMES.DYNAMIC,
    gcTime: CACHE_TIMES.DYNAMIC * 2, // Changed from cacheTime to gcTime (React Query v5)
    refetchInterval: 20000, // 20 seconds
    refetchOnWindowFocus: true,
    retry: 2,
  },
  TASKS: {
    staleTime: CACHE_TIMES.DYNAMIC,
    gcTime: CACHE_TIMES.DYNAMIC * 2, // Changed from cacheTime to gcTime (React Query v5)
    refetchInterval: 20000, // 20 seconds
    refetchOnWindowFocus: true,
    retry: 2,
  },
  LOANS: {
    staleTime: CACHE_TIMES.STANDARD,
    gcTime: CACHE_TIMES.STANDARD * 2, // Changed from cacheTime to gcTime (React Query v5)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2,
  },
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
