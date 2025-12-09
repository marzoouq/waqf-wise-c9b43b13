/**
 * useSupportStats Hook
 * Hook لجلب إحصائيات الدعم الفني
 * @version 2.8.56
 */
import { useQuery } from '@tanstack/react-query';
import { SupportService } from '@/services';
import { QUERY_KEYS } from '@/lib/query-keys';
import type { SupportStatistics } from '@/types/support';

export function useSupportStats() {
  // إحصائيات عامة
  const { data: overviewStats, isLoading: overviewLoading, error: overviewError } = useQuery({
    queryKey: ['support-stats', 'overview'],
    queryFn: () => SupportService.getOverviewStats(),
    retry: 2,
  });

  // التذاكر المتأخرة
  const { data: overdueTickets, error: overdueError } = useQuery({
    queryKey: ['support-stats', 'overdue'],
    queryFn: () => SupportService.getOverdueTickets(),
    retry: 2,
  });

  // التذاكر الحديثة
  const { data: recentTickets, error: recentError } = useQuery({
    queryKey: ['support-stats', 'recent'],
    queryFn: () => SupportService.getRecentTickets(10),
    retry: 2,
  });

  // إحصائيات تاريخية
  const { data: historicalStats, error: historicalError } = useQuery({
    queryKey: ['support-stats', 'historical'],
    queryFn: () => SupportService.getHistoricalStats(30) as Promise<SupportStatistics[]>,
    retry: 2,
  });

  return {
    overviewStats,
    overdueTickets,
    recentTickets,
    historicalStats,
    overviewLoading,
    overviewError,
    overdueError,
    recentError,
    historicalError,
  };
}
