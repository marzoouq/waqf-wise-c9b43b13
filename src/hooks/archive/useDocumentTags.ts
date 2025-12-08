/**
 * useDocumentTags Hook - يستخدم Service Layer
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArchiveService } from '@/services';

export interface DocumentTag {
  id: string;
  document_id: string;
  tag_name: string;
  tag_type: 'manual' | 'auto' | 'ai';
  confidence_score?: number;
  created_at: string;
  created_by?: string;
}

export function useDocumentTags(documentId?: string) {
  return useQuery({
    queryKey: ['document-tags', documentId],
    queryFn: () => ArchiveService.getDocumentTags(documentId),
    enabled: !!documentId,
  });
}

export function useAddDocumentTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tag: Omit<DocumentTag, 'id' | 'created_at' | 'created_by'>) => 
      ArchiveService.addDocumentTag(tag),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['document-tags', variables.document_id] });
      queryClient.invalidateQueries({ queryKey: ['document-tags'] });
      toast.success('تم إضافة الوسم بنجاح');
    },
    onError: (error: Error) => {
      toast.error('فشل إضافة الوسم: ' + error.message);
    },
  });
}

export function useDeleteDocumentTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tagId: string) => ArchiveService.deleteDocumentTag(tagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-tags'] });
      toast.success('تم حذف الوسم بنجاح');
    },
    onError: (error: Error) => {
      toast.error('فشل حذف الوسم: ' + error.message);
    },
  });
}

export function useSmartSearch() {
  return useMutation({
    mutationFn: ({ query, searchType }: { query: string; searchType: 'text' | 'tags' | 'ocr' }) =>
      ArchiveService.smartSearch(query, searchType),
  });
}
