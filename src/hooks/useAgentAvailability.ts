import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AgentAvailability {
  id: string;
  user_id: string;
  is_available: boolean;
  current_load: number;
  max_capacity: number;
  skills: string[];
  priority_level: number;
}

export function useAgentAvailability(userId?: string) {
  return useQuery({
    queryKey: ['agent-availability', userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from('support_agent_availability')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useUpdateAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      isAvailable,
      maxCapacity,
      skills,
    }: {
      userId: string;
      isAvailable?: boolean;
      maxCapacity?: number;
      skills?: string[];
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('غير مصرح');

      const updates: any = {};
      if (isAvailable !== undefined) updates.is_available = isAvailable;
      if (maxCapacity !== undefined) updates.max_capacity = maxCapacity;
      if (skills !== undefined) updates.skills = skills;
      updates.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('support_agent_availability')
        .upsert({
          user_id: userId,
          ...updates,
        }, {
          onConflict: 'user_id',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-availability'] });
      toast.success('تم تحديث حالة التوافر');
    },
    onError: (error: Error) => {
      toast.error('فشل التحديث: ' + error.message);
    },
  });
}

export function useAgentStats(userId?: string, dateRange?: { from: string; to: string }) {
  return useQuery({
    queryKey: ['agent-stats', userId, dateRange],
    queryFn: async () => {
      let query = supabase
        .from('support_agent_stats')
        .select('*');

      if (userId) {
        query = query.eq('user_id', userId);
      }

      if (dateRange) {
        query = query
          .gte('date', dateRange.from)
          .lte('date', dateRange.to);
      }

      query = query.order('date', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });
}

export function useEscalations() {
  return useQuery({
    queryKey: ['support-escalations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_escalations')
        .select(`
          *,
          ticket:support_tickets(ticket_number, subject, status),
          escalated_from_user:escalated_from(id),
          escalated_to_user:escalated_to(id)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useAssignmentSettings() {
  const queryClient = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ['assignment-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_assignment_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  const updateSettings = useMutation({
    mutationFn: async (newSettings: {
      assignment_type?: string;
      auto_assign?: boolean;
      max_tickets_per_agent?: number;
    }) => {
      const { data, error } = await supabase
        .from('support_assignment_settings')
        .upsert({
          ...newSettings,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignment-settings'] });
      toast.success('تم تحديث إعدادات التعيين');
    },
    onError: (error: Error) => {
      toast.error('فشل التحديث: ' + error.message);
    },
  });

  return { settings, updateSettings };
}
