import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
    queryFn: async () => {
      let query = supabase.from('document_tags').select('*');
      
      if (documentId) {
        query = query.eq('document_id', documentId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as DocumentTag[];
    },
    enabled: !!documentId,
  });
}

export function useAddDocumentTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tag: Omit<DocumentTag, 'id' | 'created_at' | 'created_by'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('document_tags')
        .insert({
          ...tag,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
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
    mutationFn: async (tagId: string) => {
      const { error } = await supabase
        .from('document_tags')
        .delete()
        .eq('id', tagId);

      if (error) throw error;
    },
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
    mutationFn: async ({ query, searchType }: { query: string; searchType: 'text' | 'tags' | 'ocr' }) => {
      if (searchType === 'ocr') {
        // البحث في محتوى OCR
        const { data, error } = await supabase
          .from('document_ocr_content')
          .select('*, documents(*)')
          .textSearch('extracted_text', query, {
            type: 'websearch',
            config: 'arabic'
          });

        if (error) throw error;
        return data;
      } else if (searchType === 'tags') {
        // البحث في الوسوم
        const { data, error } = await supabase
          .from('document_tags')
          .select('*, documents(*)')
          .ilike('tag_name', `%${query}%`);

        if (error) throw error;
        return data;
      } else {
        // البحث النصي العادي
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .or(`name.ilike.%${query}%,description.ilike.%${query}%`);

        if (error) throw error;
        return data;
      }
    },
  });
}