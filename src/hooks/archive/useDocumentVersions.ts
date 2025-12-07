import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

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
    queryKey: ['document-versions', documentId],
    queryFn: async (): Promise<DocumentVersion[]> => {
      if (!documentId) return [];
      
      const { data, error } = await supabase
        .from('document_versions')
        .select('id, document_id, version_number, file_path, file_size, change_description, created_by, created_at, is_current, metadata')
        .eq('document_id', documentId)
        .order('version_number', { ascending: false });

      if (error) throw error;
      return (data || []) as DocumentVersion[];
    },
    enabled: !!documentId,
  });

  const createVersionMutation = useMutation({
    mutationFn: async ({
      documentId,
      filePath,
      fileSize,
      changeDescription,
    }: {
      documentId: string;
      filePath: string;
      fileSize?: number;
      changeDescription?: string;
    }) => {
      // إلغاء الإصدار الحالي
      await supabase
        .from('document_versions')
        .update({ is_current: false })
        .eq('document_id', documentId)
        .eq('is_current', true);

      // حساب رقم الإصدار الجديد
      const { data: maxVersion } = await supabase
        .from('document_versions')
        .select('version_number')
        .eq('document_id', documentId)
        .order('version_number', { ascending: false })
        .limit(1)
        .single();

      const newVersionNumber = (maxVersion?.version_number || 0) + 1;

      // إنشاء الإصدار الجديد
      const { data, error } = await supabase
        .from('document_versions')
        .insert({
          document_id: documentId,
          version_number: newVersionNumber,
          file_path: filePath,
          file_size: fileSize,
          change_description: changeDescription || `الإصدار ${newVersionNumber}`,
          is_current: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-versions', documentId] });
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
    mutationFn: async (versionId: string) => {
      // جلب الإصدار المطلوب
      const { data: version, error: versionError } = await supabase
        .from('document_versions')
        .select('id, document_id, version_number, file_path')
        .eq('id', versionId)
        .single();

      if (versionError || !version) throw new Error('الإصدار غير موجود');

      // تعيين هذا الإصدار كالإصدار الحالي
      await supabase
        .from('document_versions')
        .update({ is_current: false })
        .eq('document_id', version.document_id);

      const { error: updateError } = await supabase
        .from('document_versions')
        .update({ is_current: true })
        .eq('id', versionId);

      if (updateError) throw updateError;

      return version;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-versions', documentId] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
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
