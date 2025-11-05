import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TOAST_MESSAGES, QUERY_STALE_TIME } from "@/lib/constants";
import { useAuth } from "./useAuth";

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
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error; // Ignore not found
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
