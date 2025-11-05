import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TOAST_MESSAGES, QUERY_STALE_TIME } from "@/lib/constants";

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

export function useProfile(userId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") throw error; // Ignore not found
      return data as Profile | null;
    },
    enabled: !!userId,
    staleTime: QUERY_STALE_TIME.DEFAULT,
  });

  const upsertProfile = useMutation({
    mutationFn: async (profileData: Partial<Profile>) => {
      const { data, error } = await supabase
        .from("profiles")
        .upsert([profileData], { onConflict: "user_id" })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast({
        title: TOAST_MESSAGES.SUCCESS.UPDATE,
        description: "تم تحديث الملف الشخصي بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: TOAST_MESSAGES.ERROR.UPDATE,
        description: error.message || "حدث خطأ أثناء تحديث الملف الشخصي",
        variant: "destructive",
      });
    },
  });

  return {
    profile,
    isLoading,
    upsertProfile: upsertProfile.mutateAsync,
  };
}
