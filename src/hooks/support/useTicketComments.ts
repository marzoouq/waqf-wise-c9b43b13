import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SupportService } from '@/services/support.service';
import { toast } from 'sonner';
import { useEffect } from 'react';
import type { TicketComment } from '@/types/support';
import { QUERY_KEYS } from '@/lib/query-keys';

/**
 * Hook لإدارة تعليقات تذاكر الدعم
 */
export function useTicketComments(ticketId: string) {
  const queryClient = useQueryClient();

  // جلب التعليقات
  const { data: comments, isLoading } = useQuery({
    queryKey: QUERY_KEYS.TICKET_COMMENTS(ticketId),
    queryFn: () => SupportService.getTicketComments(ticketId),
    enabled: !!ticketId,
  });

  // الاشتراك في التحديثات الفورية
  useEffect(() => {
    if (!ticketId) return;

    const channel = supabase
      .channel(`ticket-comments-${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_ticket_comments',
          filter: `ticket_id=eq.${ticketId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['ticket-comments', ticketId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticketId, queryClient]);

  // إضافة تعليق
  const addComment = useMutation({
    mutationFn: async ({
      comment,
      isInternal = false,
      isSolution = false,
    }: {
      comment: string;
      isInternal?: boolean;
      isSolution?: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('يجب تسجيل الدخول');

      const { data, error } = await supabase
        .from('support_ticket_comments')
        .insert({
          ticket_id: ticketId,
          user_id: user.id,
          comment,
          is_internal: isInternal,
          is_solution: isSolution,
        })
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('فشل إضافة التعليق');

      // إذا كان حل، تحديث حالة التذكرة
      if (isSolution) {
        await supabase
          .from('support_tickets')
          .update({
            status: 'resolved',
            resolved_at: new Date().toISOString(),
          })
          .eq('id', ticketId);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-comments', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      toast.success('تم إضافة التعليق بنجاح');
    },
    onError: (error: Error) => {
      toast.error('فشل إضافة التعليق: ' + error.message);
    },
  });

  // تحديث تعليق
  const updateComment = useMutation({
    mutationFn: async ({ id, comment }: { id: string; comment: string }) => {
      const { data, error } = await supabase
        .from('support_ticket_comments')
        .update({
          comment,
          edited_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('التعليق غير موجود');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-comments', ticketId] });
      toast.success('تم تحديث التعليق بنجاح');
    },
    onError: (error: Error) => {
      toast.error('فشل تحديث التعليق: ' + error.message);
    },
  });

  return {
    comments,
    isLoading,
    addComment,
    updateComment,
  };
}
