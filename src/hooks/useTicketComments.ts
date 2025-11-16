import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useEffect } from 'react';
import type { TicketComment } from '@/types/support';

export function useTicketComments(ticketId: string) {
  const queryClient = useQueryClient();

  // Fetch comments
  const { data: comments, isLoading } = useQuery({
    queryKey: ['ticket-comments', ticketId],
    queryFn: async () => {
      const { data, error }: any = await supabase
        .from('ticket_comments')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as TicketComment[];
    },
    enabled: !!ticketId,
  });

  // Realtime subscription
  useEffect(() => {
    if (!ticketId) return;

    const channel = supabase
      .channel(`ticket-comments-${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ticket_comments',
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

  // Add comment
  const addComment = useMutation({
    mutationFn: async ({ comment, isInternal = false, isSolution = false }: { 
      comment: string; 
      isInternal?: boolean;
      isSolution?: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('يجب تسجيل الدخول');

      const { data, error }: any = await supabase
        .from('ticket_comments')
        .insert({
          ticket_id: ticketId,
          user_id: user.id,
          comment,
          is_internal: isInternal,
          is_solution: isSolution,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-comments', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['support-ticket', ticketId] });
      toast.success('تم إضافة التعليق بنجاح');
    },
    onError: (error) => {
      toast.error('فشل إضافة التعليق: ' + error.message);
    },
  });

  // Update comment
  const updateComment = useMutation({
    mutationFn: async ({ id, comment }: { id: string; comment: string }) => {
      const { data, error }: any = await supabase
        .from('ticket_comments')
        .update({
          comment,
          edited_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-comments', ticketId] });
      toast.success('تم تحديث التعليق بنجاح');
    },
    onError: (error) => {
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
