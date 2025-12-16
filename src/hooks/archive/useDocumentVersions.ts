/**
 * useDocumentVersions Hook
 * Hook لإدارة إصدارات المستندات
 * @version 2.8.56
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/ui/use-toast';
import { logger } from '@/lib/logger';
import { QUERY_KEYS } from '@/lib/query-keys';
import { ArchiveService } from '@/services';

export interface DocumentVersion {
  id: string;
  document_id: string;
  version_number: number;
  file_path: string;
  file_size: number | null;
  change_description: string | null;
  created_by: string | null;
  created_at: string;
  is_current: boolean;
  metadata: Record<string, unknown>;
}

export function useDocumentVersions(documentId: string | undefined) {
  const queryClient = useQueryClient();

  const { data: versions, isLoading } = useQuery({
    queryKey: QUERY_KEYS.DOCUMENT_VERSIONS(documentId || ''),
    queryFn: () => ArchiveService.getDocumentVersions(documentId!) as Promise<DocumentVersion[]>,
    enabled: !!documentId,
  });

  const createVersionMutation = useMutation({
    mutationFn: (data: {
      documentId: string;
      filePath: string;
      fileSize?: number;
      changeDescription?: string;
    }) => ArchiveService.createDocumentVersion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DOCUMENT_VERSIONS(documentId || '') });
      toast({
        title: 'تم إنشاء الإصدار',
        description: 'تم حفظ إصدار جديد من المستند',
      });
    },
    onError: (error) => {
      logger.error(error, { context: 'create_document_version', severity: 'medium' });
      toast({
        title: 'خطأ',
        description: 'فشل في إنشاء إصدار جديد',
        variant: 'destructive',
      });
    },
  });

  const restoreVersionMutation = useMutation({
    mutationFn: (versionId: string) => ArchiveService.restoreDocumentVersion(versionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DOCUMENT_VERSIONS(documentId || '') });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DOCUMENTS });
      toast({
        title: 'تم الاستعادة',
        description: 'تم استعادة الإصدار السابق بنجاح',
      });
    },
    onError: (error) => {
      logger.error(error, { context: 'restore_document_version', severity: 'medium' });
      toast({
        title: 'خطأ',
        description: 'فشل في استعادة الإصدار',
        variant: 'destructive',
      });
    },
  });

  return {
    versions,
    isLoading,
    currentVersion: versions?.find(v => v.is_current),
    createVersion: createVersionMutation.mutate,
    isCreating: createVersionMutation.isPending,
    restoreVersion: restoreVersionMutation.mutate,
    isRestoring: restoreVersionMutation.isPending,
  };
}
