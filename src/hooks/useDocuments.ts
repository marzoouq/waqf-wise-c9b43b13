import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { QUERY_KEYS, TOAST_MESSAGES, QUERY_STALE_TIME } from "@/lib/constants";

export interface Document {
  id: string;
  name: string;
  description?: string;
  file_type: string;
  file_size: string;
  category: string;
  folder_id?: string;
  uploaded_at: string;
  created_at: string;
}

export function useDocuments() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: documents = [], isLoading } = useQuery({
    queryKey: [QUERY_KEYS.DOCUMENTS],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .order("uploaded_at", { ascending: false });

      if (error) throw error;
      return data as Document[];
    },
    staleTime: QUERY_STALE_TIME.DEFAULT,
  });

  const addDocument = useMutation({
    mutationFn: async (document: Omit<Document, "id" | "created_at" | "uploaded_at">) => {
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
    onError: (error: any) => {
      toast({
        title: TOAST_MESSAGES.ERROR.ADD,
        description: error.message || "حدث خطأ أثناء رفع المستند",
        variant: "destructive",
      });
    },
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
    onError: (error: any) => {
      toast({
        title: TOAST_MESSAGES.ERROR.UPDATE,
        description: error.message || "حدث خطأ أثناء تحديث المستند",
        variant: "destructive",
      });
    },
  });

  return {
    documents,
    isLoading,
    addDocument: addDocument.mutateAsync,
    updateDocument: updateDocument.mutateAsync,
  };
}
