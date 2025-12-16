import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserService } from "@/services/user.service";
import { AuthService } from "@/services/auth.service";
import { useToast } from "@/hooks/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { QUERY_KEYS } from "@/lib/query-keys";

export interface ActiveSession {
  id: string;
  user_id: string;
  session_token: string;
  ip_address?: string;
  user_agent?: string;
  device_info?: {
    browser?: string;
    os?: string;
    device?: string;
  };
  is_active: boolean;
  last_activity_at: string;
  created_at: string;
}

export function useActiveSessions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: sessions = [], isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.ACTIVE_SESSIONS(user?.id),
    queryFn: async () => {
      if (!user?.id) return [];
      const data = await UserService.getActiveSessions(user.id);
      return data as ActiveSession[];
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000,
  });

  const endSession = useMutation({
    mutationFn: async (sessionId: string) => {
      if (!user?.id) throw new Error("User not authenticated");
      await UserService.endSession(sessionId, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ACTIVE_SESSIONS() });
      toast({
        title: "تم إنهاء الجلسة",
        description: "تم إنهاء الجلسة بنجاح",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل في إنهاء الجلسة",
        variant: "destructive",
      });
    },
  });

  const endAllOtherSessions = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("User not authenticated");
      const session = await AuthService.getSession();
      const currentSessionToken = session?.access_token || "";
      await UserService.endAllOtherSessions(user.id, currentSessionToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ACTIVE_SESSIONS() });
      toast({
        title: "تم إنهاء الجلسات",
        description: "تم إنهاء جميع الجلسات الأخرى بنجاح",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل في إنهاء الجلسات",
        variant: "destructive",
      });
    },
  });

  return {
    sessions,
    isLoading,
    error,
    refetch,
    endSession: endSession.mutateAsync,
    endAllOtherSessions: endAllOtherSessions.mutateAsync,
    isEndingSession: endSession.isPending,
    isEndingAllSessions: endAllOtherSessions.isPending,
  };
}
