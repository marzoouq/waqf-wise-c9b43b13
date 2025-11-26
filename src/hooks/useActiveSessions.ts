import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "./useAuth";

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

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["active-sessions", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("user_sessions")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("last_activity_at", { ascending: false });

      if (error) throw error;
      return data as ActiveSession[];
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000, // 30 seconds
  });

  const endSession = useMutation({
    mutationFn: async (sessionId: string) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      const { error } = await supabase.rpc("end_user_session", {
        p_session_id: sessionId,
        p_user_id: user.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-sessions"] });
      toast({
        title: "تم إنهاء الجلسة",
        description: "تم إنهاء الجلسة بنجاح",
      });
    },
    onError: (error: any) => {
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

      // Get current session token from storage
      const { data: { session } } = await supabase.auth.getSession();
      const currentSessionToken = session?.access_token;

      // End all sessions except current
      const { error } = await supabase
        .from("user_sessions")
        .update({ 
          is_active: false,
          ended_at: new Date().toISOString()
        })
        .eq("user_id", user.id)
        .neq("session_token", currentSessionToken || "");

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-sessions"] });
      toast({
        title: "تم إنهاء الجلسات",
        description: "تم إنهاء جميع الجلسات الأخرى بنجاح",
      });
    },
    onError: (error: any) => {
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
    endSession: endSession.mutateAsync,
    endAllOtherSessions: endAllOtherSessions.mutateAsync,
    isEndingSession: endSession.isPending,
    isEndingAllSessions: endAllOtherSessions.isPending,
  };
}
