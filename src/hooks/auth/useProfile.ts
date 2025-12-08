import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthService } from "@/services/auth.service";
import { useToast } from "@/hooks/use-toast";
import { TOAST_MESSAGES } from "@/lib/constants";
import { useAuth } from "@/contexts/AuthContext";
import { createMutationErrorHandler } from "@/lib/errors";

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
    queryFn: () => AuthService.getProfile(user?.id || ''),
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  const upsertProfile = useMutation({
    mutationFn: async (profileData: Partial<Profile>) => {
      if (!user?.id) throw new Error("User not authenticated");
      return AuthService.upsertProfile(user.id, profileData);
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
