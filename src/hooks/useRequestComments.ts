import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TOAST_MESSAGES, QUERY_STALE_TIME } from "@/lib/constants";
import { createMutationErrorHandler } from "@/lib/errors";

export interface RequestComment {
  id: string;
  request_id: string;
  user_id: string | null;
  comment: string;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

export function useRequestComments(requestId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["request-comments", requestId || undefined],
    queryFn: async () => {
      if (!requestId) return [];
      
      const { data, error } = await supabase
        .from("request_comments")
        .select("*")
        .eq("request_id", requestId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Get profiles separately
      const commentsWithProfiles = await Promise.all(
        (data || []).map(async (comment) => {
          if (comment.user_id) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("full_name, email")
              .eq("user_id", comment.user_id)
              .single();
            
            return {
              ...comment,
              profiles: profile || { full_name: "مستخدم", email: "" },
            };
          }
          return {
            ...comment,
            profiles: { full_name: "مستخدم", email: "" },
          };
        })
      );
      
      return commentsWithProfiles as RequestComment[];
    },
    staleTime: QUERY_STALE_TIME.DEFAULT,
    enabled: !!requestId,
  });

  const addComment = useMutation({
    mutationFn: async (comment: {
      request_id: string;
      comment: string;
      is_internal?: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("غير مصرح");

      const { data, error } = await supabase
        .from("request_comments")
        .insert([{
          ...comment,
          user_id: user.id,
          is_internal: comment.is_internal || false,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["request-comments"] });
      toast({
        title: "تم بنجاح",
        description: "تم إضافة التعليق بنجاح",
      });
    },
    onError: createMutationErrorHandler({ 
      context: 'add_request_comment',
      toastTitle: TOAST_MESSAGES.ERROR.ADD
    }),
  });

  const updateComment = useMutation({
    mutationFn: async ({ id, comment }: { id: string; comment: string }) => {
      const { data, error } = await supabase
        .from("request_comments")
        .update({ comment })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["request-comments"] });
      toast({
        title: "تم بنجاح",
        description: "تم تحديث التعليق بنجاح",
      });
    },
    onError: createMutationErrorHandler({ 
      context: 'update_request_comment',
      toastTitle: TOAST_MESSAGES.ERROR.UPDATE
    }),
  });

  const deleteComment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("request_comments")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["request-comments"] });
      toast({
        title: "تم بنجاح",
        description: "تم حذف التعليق بنجاح",
      });
    },
    onError: createMutationErrorHandler({ 
      context: 'delete_request_comment',
      toastTitle: TOAST_MESSAGES.ERROR.DELETE
    }),
  });

  return {
    comments,
    isLoading,
    addComment: addComment.mutateAsync,
    updateComment: updateComment.mutateAsync,
    deleteComment: deleteComment.mutateAsync,
  };
}
