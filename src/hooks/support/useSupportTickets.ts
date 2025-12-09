/**
 * Support Tickets Hooks
 * يستخدم SupportService
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SupportService, type SupportFilters } from '@/services/support.service';
import { supabase } from '@/integrations/supabase/client';
import { QUERY_KEYS } from '@/lib/query-keys';
import { toast } from 'sonner';
import type { 
  SupportTicket, 
  CreateTicketInput, 
  UpdateTicketInput 
} from '@/types/support';

/**
 * Hook لإدارة تذاكر الدعم الفني
 */
export function useSupportTickets(filters?: SupportFilters) {
  const queryClient = useQueryClient();

  // جلب التذاكر
  const { data: tickets, isLoading, error } = useQuery({
    queryKey: [QUERY_KEYS.SUPPORT_TICKETS, filters],
    queryFn: () => SupportService.getTickets(filters),
  });

  // إنشاء تذكرة جديدة
  const createTicket = useMutation({
    mutationFn: async (input: CreateTicketInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('يجب تسجيل الدخول');

      const ticketNumber = `TKT-${Date.now()}`;
      
      const { data, error } = await supabase
        .from('support_tickets')
        .insert([{
          ticket_number: ticketNumber,
          subject: input.subject,
          description: input.description,
          category: input.category,
          priority: input.priority,
          source: 'portal',
          user_id: user.id,
          beneficiary_id: input.beneficiary_id || null,
          tags: input.tags || null,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUPPORT_TICKETS });
      toast.success('تم إنشاء التذكرة بنجاح');
    },
    onError: (error: Error) => {
      toast.error('فشل إنشاء التذكرة: ' + error.message);
    },
  });

  // تحديث تذكرة
  const updateTicket = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateTicketInput }) =>
      SupportService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUPPORT_TICKETS });
      toast.success('تم تحديث التذكرة بنجاح');
    },
    onError: (error: Error) => {
      toast.error('فشل تحديث التذكرة: ' + error.message);
    },
  });

  // إغلاق تذكرة
  const closeTicket = useMutation({
    mutationFn: (id: string) => SupportService.close(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUPPORT_TICKETS });
      toast.success('تم إغلاق التذكرة بنجاح');
    },
    onError: (error: Error) => {
      toast.error('فشل إغلاق التذكرة: ' + error.message);
    },
  });

  // إعادة فتح تذكرة
  const reopenTicket = useMutation({
    mutationFn: (id: string) => SupportService.reopen(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUPPORT_TICKETS });
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
      return SupportService.assign(ticketId, userId, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUPPORT_TICKETS });
      toast.success('تم تعيين التذكرة بنجاح');
    },
    onError: (error: Error) => {
      toast.error('فشل تعيين التذكرة: ' + error.message);
    },
  });

  return {
    tickets: tickets as SupportTicket[] | undefined,
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
    queryKey: QUERY_KEYS.SUPPORT_TICKET(ticketId),
    queryFn: async () => {
      const ticket = await SupportService.getById(ticketId);
      if (!ticket) throw new Error('التذكرة غير موجودة');
      return ticket as SupportTicket;
    },
    enabled: !!ticketId,
  });
}
