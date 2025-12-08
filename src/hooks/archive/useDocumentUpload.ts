import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArchiveService } from "@/services";
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
      return ArchiveService.uploadDocument(file, name, category, description, folder_id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DOCUMENTS] });
      toast({ title: "تم الرفع بنجاح" });
    },
  });

  const deleteDocumentWithFile = useMutation({
    mutationFn: async ({ id, storagePath }: { id: string; storagePath?: string | null }) => {
      return ArchiveService.deleteDocument(id, storagePath);
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
