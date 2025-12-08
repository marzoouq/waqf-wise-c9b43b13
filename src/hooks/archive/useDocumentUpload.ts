import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { QUERY_KEYS } from "@/lib/constants";

interface UploadDocumentParams {
  file: File;
  name: string;
  category: string;
  description?: string;
  folder_id?: string;
}

export function useDocumentUpload() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadDocument = useMutation({
    mutationFn: async ({ file, name, category, description, folder_id }: UploadDocumentParams) => {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'pdf';
      const storagePath = `${category}/${Date.now()}_${name.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_')}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from('archive-documents').upload(storagePath, file);
      if (uploadError) throw new Error(`فشل في رفع الملف: ${uploadError.message}`);

      const { data: urlData } = supabase.storage.from('archive-documents').getPublicUrl(storagePath);
      const formatSize = (b: number) => b < 1024 ? `${b} B` : b < 1048576 ? `${(b/1024).toFixed(1)} KB` : `${(b/1048576).toFixed(1)} MB`;

      const { data, error } = await supabase.from('documents').insert({
        name, category, description, file_type: fileExt.toUpperCase(), file_size: formatSize(file.size),
        file_size_bytes: file.size, folder_id, storage_path: storagePath, file_path: urlData.publicUrl,
      }).select().single();

      if (error) { await supabase.storage.from('archive-documents').remove([storagePath]); throw error; }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DOCUMENTS] });
      toast({ title: "تم الرفع بنجاح" });
    },
  });

  const deleteDocumentWithFile = useMutation({
    mutationFn: async ({ id, storagePath }: { id: string; storagePath?: string | null }) => {
      if (storagePath) await supabase.storage.from('archive-documents').remove([storagePath]);
      const { error } = await supabase.from('documents').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DOCUMENTS] });
      toast({ title: "تم الحذف" });
    },
  });

  return {
    uploadDocument: uploadDocument.mutateAsync,
    isUploading: uploadDocument.isPending,
    deleteDocumentWithFile: deleteDocumentWithFile.mutateAsync,
    isDeleting: deleteDocumentWithFile.isPending,
  };
}
