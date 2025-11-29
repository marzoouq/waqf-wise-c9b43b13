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
      // Generate unique file path
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'pdf';
      const timestamp = Date.now();
      const sanitizedName = name.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_');
      const storagePath = `${category}/${timestamp}_${sanitizedName}.${fileExt}`;

      // Upload file to Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('archive-documents')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`فشل في رفع الملف: ${uploadError.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('archive-documents')
        .getPublicUrl(storagePath);

      // Format file size
      const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
      };

      // Insert document record
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .insert({
          name,
          category,
          description: description || null,
          file_type: fileExt.toUpperCase(),
          file_size: formatFileSize(file.size),
          file_size_bytes: file.size,
          folder_id: folder_id || null,
          storage_path: storagePath,
          file_path: urlData.publicUrl,
        })
        .select()
        .single();

      if (docError) {
        // Clean up uploaded file if document insert fails
        await supabase.storage.from('archive-documents').remove([storagePath]);
        throw new Error(`فشل في حفظ بيانات المستند: ${docError.message}`);
      }

      return docData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DOCUMENTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FOLDERS] });
      toast({
        title: "تم الرفع بنجاح",
        description: "تم رفع المستند وحفظه في الأرشيف",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في الرفع",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteDocumentWithFile = useMutation({
    mutationFn: async ({ id, storagePath }: { id: string; storagePath?: string | null }) => {
      // Delete file from storage if path exists
      if (storagePath) {
        await supabase.storage.from('archive-documents').remove([storagePath]);
      }

      // Delete document record
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DOCUMENTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FOLDERS] });
      toast({
        title: "تم الحذف",
        description: "تم حذف المستند من الأرشيف",
      });
    },
    onError: () => {
      toast({
        title: "خطأ في الحذف",
        description: "حدث خطأ أثناء حذف المستند",
        variant: "destructive",
      });
    },
  });

  return {
    uploadDocument: uploadDocument.mutateAsync,
    isUploading: uploadDocument.isPending,
    deleteDocumentWithFile: deleteDocumentWithFile.mutateAsync,
    isDeleting: deleteDocumentWithFile.isPending,
  };
}
