import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { SupportStatistics } from '@/types/support';

/**
 * Hook لجلب إحصائيات لوحة التحكم الخاصة بالدعم الفني
 */
export function useSupportStats() {
  // إحصائيات عامة
  const { data: overviewStats, isLoading: overviewLoading } = useQuery({
    queryKey: ['support-stats', 'overview'],
    queryFn: async () => {
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
    },
  });

  // التذاكر المتأخرة
  const { data: overdueTickets } = useQuery({
    queryKey: ['support-stats', 'overdue'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('is_overdue', true)
        .order('sla_due_at', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // التذاكر الحديثة
  const { data: recentTickets } = useQuery({
    queryKey: ['support-stats', 'recent'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_tickets')
        .select(`
          *,
          user:user_id(email),
          beneficiary:beneficiary_id(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });

  // إحصائيات تاريخية (آخر 30 يوم)
  const { data: historicalStats } = useQuery({
    queryKey: ['support-stats', 'historical'],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from('support_statistics')
        .select('*')
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;
      return data as SupportStatistics[];
    },
  });

  return {
    overviewStats,
    overdueTickets,
    recentTickets,
    historicalStats,
    overviewLoading,
  };
}
