import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TOAST_MESSAGES } from "@/lib/constants";
import { QUERY_CONFIG } from "@/lib/queryOptimization";
import { createMutationErrorHandler } from "@/lib/errorHandling";

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

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as Task[];
    },
    ...QUERY_CONFIG.TASKS,
  });

  const addTask = useMutation({
    mutationFn: async (task: Omit<Task, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("tasks")
        .insert([task])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
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
    mutationFn: async ({ id, ...updates }: Partial<Task> & { id: string }) => {
      const { data, error } = await supabase
        .from("tasks")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
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
    addTask: addTask.mutateAsync,
    updateTask: updateTask.mutateAsync,
  };
}
