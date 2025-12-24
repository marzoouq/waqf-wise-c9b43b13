import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UIService } from "@/services/ui.service";
import { useToast } from "@/hooks/ui/use-toast";
import { TOAST_MESSAGES } from "@/lib/constants";
import { QUERY_CONFIG } from "@/infrastructure/react-query";
import { createMutationErrorHandler } from "@/lib/errors";
import { QUERY_KEYS } from "@/lib/query-keys";

export interface Task {
  id: string;
  task: string;
  priority: "عالية" | "متوسطة" | "منخفضة";
  status: string;
  created_at: string;
  updated_at: string;
}

export function useTasks() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.TASKS,
    queryFn: () => UIService.getTasks(10),
    ...QUERY_CONFIG.TASKS,
  });

  const addTask = useMutation({
    mutationFn: (task: Omit<Task, "id" | "created_at" | "updated_at">) =>
      UIService.addTask(task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TASKS });
      toast({
        title: TOAST_MESSAGES.SUCCESS.ADD,
        description: "تم إضافة المهمة بنجاح",
      });
    },
    onError: createMutationErrorHandler({ 
      context: 'add_task',
      toastTitle: TOAST_MESSAGES.ERROR.ADD
    }),
  });

  const updateTask = useMutation({
    mutationFn: ({ id, ...updates }: Partial<Task> & { id: string }) =>
      UIService.updateTask(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TASKS });
      toast({
        title: TOAST_MESSAGES.SUCCESS.UPDATE,
        description: "تم تحديث المهمة بنجاح",
      });
    },
    onError: createMutationErrorHandler({ 
      context: 'update_task',
      toastTitle: TOAST_MESSAGES.ERROR.UPDATE
    }),
  });

  return {
    tasks,
    isLoading,
    error,
    refetch,
    addTask: addTask.mutateAsync,
    updateTask: updateTask.mutateAsync,
  };
}
