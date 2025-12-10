import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { TOAST_MESSAGES, QUERY_STALE_TIME } from "@/lib/constants";
import { QUERY_KEYS } from "@/lib/query-keys";
import { createMutationErrorHandler } from "@/lib/errors";
import { ArchiveService } from "@/services/archive.service";

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
    queryKey: QUERY_KEYS.FOLDERS,
    queryFn: () => ArchiveService.getFolders(),
    staleTime: QUERY_STALE_TIME.DEFAULT,
  });

  const addFolder = useMutation({
    mutationFn: (folder: Omit<Folder, "id" | "created_at" | "updated_at" | "files_count">) => 
      ArchiveService.createFolder({ ...folder, files_count: 0 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FOLDERS });
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
    mutationFn: ({ id, ...updates }: Partial<Folder> & { id: string }) => 
      ArchiveService.updateFolder(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FOLDERS });
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
