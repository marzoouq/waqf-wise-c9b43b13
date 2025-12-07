import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useTicketRating(ticketId: string) {
  return useQuery({
    queryKey: ['ticket-rating', ticketId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_ticket_ratings')
        .select('id, ticket_id, rating, feedback, response_speed_rating, solution_quality_rating, staff_friendliness_rating, rated_by, created_at')
        .eq('ticket_id', ticketId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!ticketId,
  });
}

export function useAddTicketRating() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ticketId,
      rating,
      feedback,
      responseSpeedRating,
      solutionQualityRating,
      staffFriendlinessRating,
    }: {
      ticketId: string;
      rating: number;
      feedback?: string;
      responseSpeedRating?: number;
      solutionQualityRating?: number;
      staffFriendlinessRating?: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('support_ticket_ratings')
        .insert({
          ticket_id: ticketId,
          rating,
          feedback,
          response_speed_rating: responseSpeedRating,
          solution_quality_rating: solutionQualityRating,
          staff_friendliness_rating: staffFriendlinessRating,
          rated_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ticket-rating', variables.ticketId] });
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['support-stats'] });
      toast.success('تم إضافة التقييم بنجاح');
    },
    onError: (error: Error) => {
      toast.error('فشل إضافة التقييم: ' + error.message);
    },
  });
}
