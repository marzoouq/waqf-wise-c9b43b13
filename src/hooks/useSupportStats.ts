import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SupportDashboardStats {
  total_tickets: number;
  open_tickets: number;
  in_progress_tickets: number;
  resolved_tickets: number;
  closed_tickets: number;
  overdue_tickets: number;
  avg_response_time: number | null;
  avg_resolution_time: number | null;
  sla_compliance_rate: number | null;
  avg_rating: number | null;
  total_ratings: number;
  tickets_by_category: { category: string; count: number }[];
  tickets_by_priority: { priority: string; count: number }[];
  tickets_trend: { date: string; count: number }[];
}

export function useSupportStats() {
  return useQuery({
    queryKey: ['support-stats'],
    queryFn: async () => {
      // Get all tickets count
      const { count: totalTickets }: any = await supabase
        .from('support_tickets')
        .select('*', { count: 'exact', head: true });

      // Get open tickets
      const { count: openTickets }: any = await supabase
        .from('support_tickets')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');

      // Get in progress tickets
      const { count: inProgressTickets }: any = await supabase
        .from('support_tickets')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'in_progress');

      // Get resolved tickets
      const { count: resolvedTickets }: any = await supabase
        .from('support_tickets')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'resolved');

      // Get closed tickets
      const { count: closedTickets }: any = await supabase
        .from('support_tickets')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'closed');

      // Get overdue tickets
      const { count: overdueTickets }: any = await supabase
        .from('support_tickets')
        .select('*', { count: 'exact', head: true })
        .eq('is_overdue', true);

      // Get tickets by category
      const { data: categoryData }: any = await supabase
        .from('support_tickets')
        .select('category')
        .order('category');

      const ticketsByCategory = categoryData?.reduce((acc: any[], ticket: any) => {
        const existing = acc.find(item => item.category === ticket.category);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ category: ticket.category, count: 1 });
        }
        return acc;
      }, []) || [];

      // Get tickets by priority
      const { data: priorityData }: any = await supabase
        .from('support_tickets')
        .select('priority')
        .order('priority');

      const ticketsByPriority = priorityData?.reduce((acc: any[], ticket: any) => {
        const existing = acc.find(item => item.priority === ticket.priority);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ priority: ticket.priority, count: 1 });
        }
        return acc;
      }, []) || [];

      // Get average rating
      const { data: ratingsData }: any = await supabase
        .from('ticket_ratings')
        .select('rating');

      const avgRating = ratingsData?.length 
        ? ratingsData.reduce((sum, r) => sum + r.rating, 0) / ratingsData.length 
        : null;

      // Get tickets trend (last 7 days)
      const { data: trendData }: any = await supabase
        .from('support_tickets')
        .select('created_at')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at');

      const ticketsTrend = trendData?.reduce((acc: any[], ticket: any) => {
        const date = new Date(ticket.created_at).toLocaleDateString('ar-SA');
        const existing = acc.find(item => item.date === date);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ date, count: 1 });
        }
        return acc;
      }, []) || [];

      const stats: SupportDashboardStats = {
        total_tickets: totalTickets || 0,
        open_tickets: openTickets || 0,
        in_progress_tickets: inProgressTickets || 0,
        resolved_tickets: resolvedTickets || 0,
        closed_tickets: closedTickets || 0,
        overdue_tickets: overdueTickets || 0,
        avg_response_time: null, // TODO: Calculate from first_response_at
        avg_resolution_time: null, // TODO: Calculate from resolved_at
        sla_compliance_rate: null, // TODO: Calculate
        avg_rating: avgRating,
        total_ratings: ratingsData?.length || 0,
        tickets_by_category: ticketsByCategory,
        tickets_by_priority: ticketsByPriority,
        tickets_trend: ticketsTrend,
      };

      return stats;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}
