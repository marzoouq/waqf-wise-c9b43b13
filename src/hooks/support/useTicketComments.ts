import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SupportService } from '@/services/support.service';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { QUERY_KEYS } from '@/lib/query-keys';

/**
 * Hook لإدارة تعليقات تذاكر الدعم
 * @version 2.8.73 - Refactored to use SupportService
 */
export function useTicketComments(ticketId: string) {
  const queryClient = useQueryClient();

  // جلب التعليقات
  const { data: comments, isLoading } = useQuery({
    queryKey: QUERY_KEYS.TICKET_COMMENTS(ticketId),
    queryFn: () => SupportService.getTicketComments(ticketId),
    enabled: !!ticketId,
  });

  // الاشتراك في التحديثات الفورية (Realtime acceptable in hooks)
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
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TICKET_COMMENTS(ticketId) });
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
      return SupportService.addTicketComment({
        ticketId,
        comment,
        isInternal,
        isSolution,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TICKET_COMMENTS(ticketId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUPPORT_TICKETS });
      toast.success('تم إضافة التعليق بنجاح');
    },
    onError: (error: Error) => {
      toast.error('فشل إضافة التعليق: ' + error.message);
    },
  });

  // تحديث تعليق
  const updateComment = useMutation({
    mutationFn: async ({ id, comment }: { id: string; comment: string }) => {
      return SupportService.updateTicketComment(id, comment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TICKET_COMMENTS(ticketId) });
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
