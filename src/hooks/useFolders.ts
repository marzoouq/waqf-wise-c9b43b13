import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { QUERY_KEYS, TOAST_MESSAGES, QUERY_STALE_TIME } from "@/lib/constants";
import { createMutationErrorHandler } from "@/lib/errorHandling";

export interface Folder {
  id: string;
  name: string;
  description?: string;
  files_count: number;
  created_at: string;
  updated_at: string;
}

export function useFolders() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: folders = [], isLoading } = useQuery({
    queryKey: [QUERY_KEYS.FOLDERS],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("folders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Folder[];
    },
    staleTime: QUERY_STALE_TIME.DEFAULT,
  });

  const addFolder = useMutation({
    mutationFn: async (folder: Omit<Folder, "id" | "created_at" | "updated_at" | "files_count">) => {
      const { data, error } = await supabase
        .from("folders")
        .insert([{ ...folder, files_count: 0 }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FOLDERS] });
      toast({
        title: TOAST_MESSAGES.SUCCESS.ADD,
        description: "تم إنشاء المجلد بنجاح",
      });
    },
    onError: createMutationErrorHandler({
      context: 'add_folder',
      toastTitle: TOAST_MESSAGES.ERROR.ADD,
    }),
  });

  const updateFolder = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Folder> & { id: string }) => {
      const { data, error } = await supabase
        .from("folders")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FOLDERS] });
      toast({
        title: TOAST_MESSAGES.SUCCESS.UPDATE,
        description: "تم تحديث المجلد بنجاح",
      });
    },
    onError: createMutationErrorHandler({
      context: 'update_folder',
      toastTitle: TOAST_MESSAGES.ERROR.UPDATE,
    }),
  });

  return {
    folders,
    isLoading,
    addFolder: addFolder.mutateAsync,
    updateFolder: updateFolder.mutateAsync,
  };
}
