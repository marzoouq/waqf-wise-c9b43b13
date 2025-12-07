import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { QUERY_KEYS, TOAST_MESSAGES, QUERY_STALE_TIME } from "@/lib/constants";
import { createMutationErrorHandler } from "@/lib/errors";
import { Database } from "@/integrations/supabase/types";

export interface Document {
  id: string;
  name: string;
  description: string | null;
  file_type: string;
  file_size: string;
  file_size_bytes: number | null;
  category: string;
  folder_id: string | null;
  uploaded_at: string;
  created_at: string;
  file_path: string | null;
  storage_path: string | null;
}

export function useDocuments() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: documents = [], isLoading } = useQuery({
    queryKey: [QUERY_KEYS.DOCUMENTS],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("id, name, description, file_type, file_size, file_size_bytes, category, folder_id, uploaded_at, created_at, file_path, storage_path")
        .order("uploaded_at", { ascending: false });

      if (error) throw error;
      return data as Document[];
    },
    staleTime: QUERY_STALE_TIME.DEFAULT,
  });

  const addDocument = useMutation({
    mutationFn: async (document: Omit<Database['public']['Tables']['documents']['Insert'], 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from("documents")
        .insert([document])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DOCUMENTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FOLDERS] });
      toast({
        title: TOAST_MESSAGES.SUCCESS.ADD,
        description: "تم رفع المستند بنجاح",
      });
    },
    onError: createMutationErrorHandler({
      context: 'add_document',
      toastTitle: TOAST_MESSAGES.ERROR.ADD,
    }),
  });

  const updateDocument = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Document> & { id: string }) => {
      const { data, error } = await supabase
        .from("documents")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DOCUMENTS] });
      toast({
        title: TOAST_MESSAGES.SUCCESS.UPDATE,
        description: "تم تحديث المستند بنجاح",
      });
    },
    onError: createMutationErrorHandler({
      context: 'update_document',
      toastTitle: TOAST_MESSAGES.ERROR.UPDATE,
    }),
  });

  const deleteDocument = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("documents")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DOCUMENTS] });
      toast({
        title: "تم الحذف",
        description: "تم حذف المستند بنجاح",
      });
    },
    onError: createMutationErrorHandler({
      context: 'delete_document',
      toastTitle: "خطأ في الحذف",
    }),
  });

  return {
    documents,
    isLoading,
    addDocument: addDocument.mutateAsync,
    updateDocument: updateDocument.mutateAsync,
    deleteDocument: deleteDocument.mutateAsync,
  };
}
