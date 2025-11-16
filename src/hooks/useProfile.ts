import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TOAST_MESSAGES, QUERY_STALE_TIME } from "@/lib/constants";
import { useAuth } from "./useAuth";
import { createMutationErrorHandler } from "@/lib/errorHandling";

export interface Profile {
  id: string;
  user_id?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  position?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id || undefined],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      
      return data as Profile | null;
    },
    enabled: !!user?.id,
    staleTime: QUERY_STALE_TIME.DEFAULT,
  });

  const upsertProfile = useMutation({
    mutationFn: async (profileData: Partial<Profile>) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("profiles")
        .upsert([{ ...profileData, user_id: user.id }], { onConflict: "user_id" })
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("فشل في تحديث الملف الشخصي");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast({
        title: TOAST_MESSAGES.SUCCESS.UPDATE,
        description: "تم تحديث الملف الشخصي بنجاح",
      });
    },
    onError: createMutationErrorHandler({ 
      context: 'update_profile',
      toastTitle: TOAST_MESSAGES.ERROR.UPDATE
    }),
  });

  return {
    profile,
    isLoading,
    upsertProfile: upsertProfile.mutateAsync,
  };
}
