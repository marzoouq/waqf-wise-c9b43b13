import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { 
  SupportTicket, 
  CreateTicketInput, 
  UpdateTicketInput,
  SupportFilters 
} from '@/types/support';

/**
 * Hook لإدارة تذاكر الدعم الفني
 */
export function useSupportTickets(filters?: SupportFilters) {
  const queryClient = useQueryClient();

  // جلب التذاكر
  const { data: tickets, isLoading, error } = useQuery({
    queryKey: ['support-tickets', filters],
    queryFn: async () => {
      let query = supabase
        .from('support_tickets')
        .select(`
          *,
          user:user_id(id, email),
          beneficiary:beneficiary_id(id, full_name, national_id),
          assigned_user:assigned_to(id, email)
        `)
        .order('created_at', { ascending: false });

      // تطبيق الفلاتر
      if (filters?.status && filters.status.length > 0) {
        query = query.in('status', filters.status);
      }
      if (filters?.category && filters.category.length > 0) {
        query = query.in('category', filters.category);
      }
      if (filters?.priority && filters.priority.length > 0) {
        query = query.in('priority', filters.priority);
      }
      if (filters?.assigned_to) {
        query = query.eq('assigned_to', filters.assigned_to);
      }
      if (filters?.is_overdue) {
        query = query.eq('is_overdue', true);
      }
      if (filters?.search) {
        query = query.or(`subject.ilike.%${filters.search}%,description.ilike.%${filters.search}%,ticket_number.ilike.%${filters.search}%`);
      }
      if (filters?.date_from) {
        query = query.gte('created_at', filters.date_from);
      }
      if (filters?.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as SupportTicket[];
    },
  });

  // إنشاء تذكرة جديدة
  const createTicket = useMutation({
    mutationFn: async (input: CreateTicketInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('يجب تسجيل الدخول');

      const insertData: any = {
        subject: input.subject,
        description: input.description,
        category: input.category,
        priority: input.priority,
        source: 'portal',
      };

      if (input.beneficiary_id) {
        insertData.beneficiary_id = input.beneficiary_id;
      }
      if (input.tags) {
        insertData.tags = input.tags;
      }

      const { data, error } = await supabase
        .from('support_tickets')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      toast.success('تم إنشاء التذكرة بنجاح');
    },
    onError: (error: Error) => {
      toast.error('فشل إنشاء التذكرة: ' + error.message);
    },
  });

  // تحديث تذكرة
  const updateTicket = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateTicketInput }) => {
      const { data, error } = await supabase
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
    onError: (error: Error) => {
      toast.error('فشل تحديث التذكرة: ' + error.message);
    },
  });

  // إغلاق تذكرة
  const closeTicket = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
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
    onError: (error: Error) => {
      toast.error('فشل إغلاق التذكرة: ' + error.message);
    },
  });

  // إعادة فتح تذكرة
  const reopenTicket = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('support_tickets')
        .update({
          status: 'open',
          closed_at: null,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // تحديث عداد إعادة الفتح
      await supabase
        .from('support_tickets')
        .update({ reopened_count: (data.reopened_count || 0) + 1 })
        .eq('id', id);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      toast.success('تم إعادة فتح التذكرة بنجاح');
    },
    onError: (error: Error) => {
      toast.error('فشل إعادة فتح التذكرة: ' + error.message);
    },
  });

  // تعيين تذكرة لموظف
  const assignTicket = useMutation({
    mutationFn: async ({ ticketId, userId }: { ticketId: string; userId: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('يجب تسجيل الدخول');

      const { data, error } = await supabase
        .from('support_tickets')
        .update({
          assigned_to: userId,
          assigned_at: new Date().toISOString(),
          assigned_by: user.id,
          status: 'in_progress',
        })
        .eq('id', ticketId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      toast.success('تم تعيين التذكرة بنجاح');
    },
    onError: (error: Error) => {
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

/**
 * Hook لجلب تذكرة واحدة
 */
export function useSupportTicket(ticketId: string) {
  return useQuery({
    queryKey: ['support-ticket', ticketId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_tickets')
        .select(`
          *,
          user:user_id(id, email),
          beneficiary:beneficiary_id(id, full_name, national_id),
          assigned_user:assigned_to(id, email),
          assigned_by_user:assigned_by(id, email)
        `)
        .eq('id', ticketId)
        .single();

      if (error) throw error;
      return data as SupportTicket;
    },
    enabled: !!ticketId,
  });
}
