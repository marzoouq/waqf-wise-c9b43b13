/**
 * useRequestComments Hook - تعليقات الطلبات
 * يستخدم RequestService
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { TOAST_MESSAGES, QUERY_STALE_TIME } from "@/lib/constants";
import { createMutationErrorHandler } from "@/lib/errors";
import { RequestService } from "@/services";

export interface RequestComment {
  id: string;
  request_id: string;
  user_id: string | null;
  comment: string;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
  profiles?: { full_name: string; email: string };
}

export function useRequestComments(requestId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["request-comments", requestId],
    queryFn: () => RequestService.getComments(requestId!),
    staleTime: QUERY_STALE_TIME.DEFAULT,
    enabled: !!requestId,
  });

  const addComment = useMutation({
    mutationFn: (data: { request_id: string; comment: string; is_internal?: boolean }) =>
      RequestService.addComment(data.request_id, data.comment, data.is_internal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["request-comments"] });
      toast({ title: "تم بنجاح", description: "تم إضافة التعليق بنجاح" });
    },
    onError: createMutationErrorHandler({ context: 'add_request_comment', toastTitle: TOAST_MESSAGES.ERROR.ADD }),
  });

  const updateComment = useMutation({
    mutationFn: ({ id, comment }: { id: string; comment: string }) =>
      RequestService.updateComment(id, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["request-comments"] });
      toast({ title: "تم بنجاح", description: "تم تحديث التعليق بنجاح" });
    },
    onError: createMutationErrorHandler({ context: 'update_request_comment', toastTitle: TOAST_MESSAGES.ERROR.UPDATE }),
  });

  const deleteComment = useMutation({
    mutationFn: (id: string) => RequestService.deleteComment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["request-comments"] });
      toast({ title: "تم بنجاح", description: "تم حذف التعليق بنجاح" });
    },
    onError: createMutationErrorHandler({ context: 'delete_request_comment', toastTitle: TOAST_MESSAGES.ERROR.DELETE }),
  });

  return {
    comments,
    isLoading,
    addComment: addComment.mutateAsync,
    updateComment: updateComment.mutateAsync,
    deleteComment: deleteComment.mutateAsync,
  };
}
