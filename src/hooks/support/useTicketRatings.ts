/**
 * Ticket Ratings Hooks
 * @version 2.8.52
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SupportService } from '@/services/support.service';
import { toast } from 'sonner';
import { QUERY_KEYS } from '@/lib/query-keys';

export function useTicketRating(ticketId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.TICKET_RATING(ticketId),
    queryFn: () => SupportService.getTicketRating(ticketId),
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
      return SupportService.addTicketRating({
        ticketId,
        rating,
        feedback,
        responseSpeedRating,
        solutionQualityRating,
        staffFriendlinessRating,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TICKET_RATING(variables.ticketId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUPPORT_TICKETS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUPPORT_STATS });
      toast.success('تم إضافة التقييم بنجاح');
    },
    onError: (error: Error) => {
      toast.error('فشل إضافة التقييم: ' + error.message);
    },
  });
}
