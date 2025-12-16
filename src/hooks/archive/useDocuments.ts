import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/ui/use-toast";
import { TOAST_MESSAGES, QUERY_STALE_TIME } from "@/lib/constants";
import { QUERY_KEYS } from "@/lib/query-keys";
import { createMutationErrorHandler } from "@/lib/errors";
import { ArchiveService } from "@/services/archive.service";

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

  const { data: documents = [], isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.DOCUMENTS,
    queryFn: () => ArchiveService.getDocuments(),
    staleTime: QUERY_STALE_TIME.DEFAULT,
  });

  const addDocument = useMutation({
    mutationFn: (document: Parameters<typeof ArchiveService.createDocument>[0]) => 
      ArchiveService.createDocument(document),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DOCUMENTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FOLDERS });
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
    mutationFn: ({ id, ...updates }: Partial<Document> & { id: string }) => 
      ArchiveService.updateDocument(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DOCUMENTS });
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
    mutationFn: (id: string) => ArchiveService.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DOCUMENTS });
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
    error,
    refetch,
    addDocument: addDocument.mutateAsync,
    updateDocument: updateDocument.mutateAsync,
    deleteDocument: deleteDocument.mutateAsync,
  };
}
