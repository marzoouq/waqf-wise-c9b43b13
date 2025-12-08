import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UIService, type Activity } from "@/services/ui.service";
import { useToast } from "@/hooks/use-toast";
import { TOAST_MESSAGES } from "@/lib/constants";
import { QUERY_CONFIG } from "@/lib/queryOptimization";
import { createMutationErrorHandler } from "@/lib/errors";

export type { Activity };

export function useActivities() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["activities"],
    queryFn: () => UIService.getActivities(10),
    ...QUERY_CONFIG.ACTIVITIES,
  });

  const addActivity = useMutation({
    mutationFn: (activity: Omit<Activity, "id" | "created_at" | "timestamp">) =>
      UIService.addActivity(activity),
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
