import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { productionLogger } from '@/lib/logger/production-logger';
import type { SupportStatistics } from '@/types/support';

/**
 * Hook لجلب إحصائيات لوحة التحكم الخاصة بالدعم الفني
 */
export function useSupportStats() {
  // إحصائيات عامة
  const { data: overviewStats, isLoading: overviewLoading, error: overviewError } = useQuery({
    queryKey: ['support-stats', 'overview'],
    queryFn: async () => {
      try {
      // عدد التذاكر حسب الحالة
      const { data: ticketsByStatus } = await supabase
        .from('support_tickets')
        .select('status')
        .then(result => {
          const statusCounts = result.data?.reduce((acc: Record<string, number>, ticket: { status: string }) => {
            acc[ticket.status] = (acc[ticket.status] || 0) + 1;
            return acc;
          }, {}) || {};
          
          return { data: statusCounts };
        });

      // عدد التذاكر حسب الفئة
      const { data: ticketsByCategory } = await supabase
        .from('support_tickets')
        .select('category')
        .then(result => {
          const categoryCounts = result.data?.reduce((acc: Record<string, number>, ticket: { category: string }) => {
            acc[ticket.category] = (acc[ticket.category] || 0) + 1;
            return acc;
          }, {}) || {};
          
          return { data: categoryCounts };
        });

      // عدد التذاكر حسب الأولوية
      const { data: ticketsByPriority } = await supabase
        .from('support_tickets')
        .select('priority')
        .then(result => {
          const priorityCounts = result.data?.reduce((acc: Record<string, number>, ticket: { priority: string }) => {
            acc[ticket.priority] = (acc[ticket.priority] || 0) + 1;
            return acc;
          }, {}) || {};
          
          return { data: priorityCounts };
        });

      // معدل الرضا
      const { data: ratings } = await supabase
        .from('support_ticket_ratings')
        .select('rating');

      const avgSatisfaction = ratings && ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        : 0;

        return {
          ticketsByStatus,
          ticketsByCategory,
          ticketsByPriority,
          avgSatisfaction,
          totalRatings: ratings?.length || 0,
        };
      } catch (error) {
        productionLogger.error('Error fetching overview stats:', error);
        throw error;
      }
    },
    retry: 2,
  });

  // التذاكر المتأخرة
  const { data: overdueTickets, error: overdueError } = useQuery({
    queryKey: ['support-stats', 'overdue'],
    queryFn: async () => {
      try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('id, ticket_number, subject, status, priority, category, is_overdue, sla_due_at, created_at')
        .eq('is_overdue', true)
        .order('sla_due_at', { ascending: true });

        if (error) throw error;
        return data || [];
      } catch (error) {
        productionLogger.error('Error fetching overdue tickets:', error);
        return [];
      }
    },
    retry: 2,
  });

  // التذاكر الحديثة
  const { data: recentTickets, error: recentError } = useQuery({
    queryKey: ['support-stats', 'recent'],
    queryFn: async () => {
      try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select(`
          *,
          user:user_id(email),
          beneficiary:beneficiary_id(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

        if (error) {
          productionLogger.error('Error fetching recent tickets:', error);
          return [];
        }
        return data || [];
      } catch (error) {
        productionLogger.error('Error in recent tickets query:', error);
        return [];
      }
    },
    retry: 2,
  });

  // إحصائيات تاريخية (آخر 30 يوم)
  const { data: historicalStats, error: historicalError } = useQuery({
    queryKey: ['support-stats', 'historical'],
    queryFn: async () => {
      try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from('support_statistics')
        .select('id, date, total_tickets, new_tickets, resolved_tickets, closed_tickets, reopened_tickets, avg_first_response_minutes, avg_resolution_minutes, sla_compliance_rate, avg_rating, total_ratings, active_agents, total_responses, created_at')
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: true });

        if (error) {
          productionLogger.error('Error fetching historical stats:', error);
          return [];
        }
        return (data || []) as SupportStatistics[];
      } catch (error) {
        productionLogger.error('Error in historical stats query:', error);
        return [];
      }
    },
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
