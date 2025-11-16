import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { SupportTicket, CreateTicketInput, UpdateTicketInput, SupportFilters } from '@/types/support';

export function useSupportTickets(filters?: SupportFilters) {
  const queryClient = useQueryClient();

  // Fetch tickets
  const { data: tickets, isLoading, error } = useQuery({
    queryKey: ['support-tickets', filters],
    queryFn: async () => {
      let query: any = supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status?.length) {
        query = query.in('status', filters.status);
      }
      if (filters?.category?.length) {
        query = query.in('category', filters.category);
      }
      if (filters?.priority?.length) {
        query = query.in('priority', filters.priority);
      }
      if (filters?.assigned_to) {
        query = query.eq('assigned_to', filters.assigned_to);
      }
      if (filters?.is_overdue !== undefined) {
        query = query.eq('is_overdue', filters.is_overdue);
      }
      if (filters?.date_from) {
        query = query.gte('created_at', filters.date_from);
      }
      if (filters?.date_to) {
        query = query.lte('created_at', filters.date_to);
      }
      if (filters?.search) {
        query = query.or(`subject.ilike.%${filters.search}%,description.ilike.%${filters.search}%,ticket_number.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as SupportTicket[];
    },
  });

  // Create ticket
  const createTicket = useMutation({
    mutationFn: async (input: CreateTicketInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('يجب تسجيل الدخول لإنشاء تذكرة');

      const { data, error }: any = await supabase
        .from('support_tickets')
        .insert({
          user_id: user.id,
          ...input,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      toast.success('تم إنشاء التذكرة بنجاح');
    },
    onError: (error) => {
      toast.error('فشل إنشاء التذكرة: ' + error.message);
    },
  });

  // Update ticket
  const updateTicket = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateTicketInput }) => {
      const { data, error }: any = await supabase
        .from('support_tickets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      toast.success('تم تحديث التذكرة بنجاح');
    },
    onError: (error) => {
      toast.error('فشل تحديث التذكرة: ' + error.message);
    },
  });

  // Close ticket
  const closeTicket = useMutation({
    mutationFn: async (id: string) => {
      const { data, error }: any = await supabase
        .from('support_tickets')
        .update({
          status: 'closed',
          closed_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      toast.success('تم إغلاق التذكرة بنجاح');
    },
    onError: (error) => {
      toast.error('فشل إغلاق التذكرة: ' + error.message);
    },
  });

  // Reopen ticket
  const reopenTicket = useMutation({
    mutationFn: async (id: string) => {
      const { data, error }: any = await supabase
        .from('support_tickets')
        .update({
          status: 'open',
          closed_at: null,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      toast.success('تم إعادة فتح التذكرة بنجاح');
    },
    onError: (error) => {
      toast.error('فشل إعادة فتح التذكرة: ' + error.message);
    },
  });

  // Assign ticket
  const assignTicket = useMutation({
    mutationFn: async ({ id, assignedTo }: { id: string; assignedTo: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error }: any = await supabase
        .from('support_tickets')
        .update({
          assigned_to: assignedTo,
          assigned_at: new Date().toISOString(),
          assigned_by: user?.id,
          status: 'in_progress',
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      toast.success('تم تعيين التذكرة بنجاح');
    },
    onError: (error) => {
      toast.error('فشل تعيين التذكرة: ' + error.message);
    },
  });

  return {
    tickets,
    isLoading,
    error,
    createTicket,
    updateTicket,
    closeTicket,
    reopenTicket,
    assignTicket,
  };
}

export function useSupportTicket(id: string) {
  return useQuery({
    queryKey: ['support-ticket', id],
    queryFn: async () => {
      const { data, error }: any = await supabase
        .from('support_tickets')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as SupportTicket;
    },
    enabled: !!id,
  });
}
