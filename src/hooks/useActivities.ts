import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TOAST_MESSAGES } from "@/lib/constants";
import { QUERY_CONFIG } from "@/lib/queryOptimization";
import { createMutationErrorHandler } from "@/lib/errorHandling";

export interface Activity {
  id: string;
  action: string;
  user_name: string;
  timestamp: string;
  created_at: string;
}

export function useActivities() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["activities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recent_activities")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as Activity[];
    },
    ...QUERY_CONFIG.ACTIVITIES,
  });

  const addActivity = useMutation({
    mutationFn: async (activity: Omit<Activity, "id" | "created_at" | "timestamp">) => {
      const { data, error } = await supabase
        .from("activities")
        .insert([activity])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
    onError: createMutationErrorHandler({
      context: 'add_activity',
      toastTitle: TOAST_MESSAGES.ERROR.ADD,
    }),
  });

  return {
    activities,
    isLoading,
    addActivity: addActivity.mutateAsync,
  };
}
