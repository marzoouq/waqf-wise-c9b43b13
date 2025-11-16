import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { KBArticle, KBFAQ } from '@/types/support';

/**
 * Hook لإدارة قاعدة المعرفة
 */
export function useKnowledgeBase() {
  const queryClient = useQueryClient();

  // جلب المقالات المنشورة
  const { data: articles, isLoading: articlesLoading } = useQuery({
    queryKey: ['kb-articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kb_articles')
        .select('*')
        .eq('status', 'published')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as KBArticle[];
    },
  });

  // جلب المقالات المميزة
  const { data: featuredArticles } = useQuery({
    queryKey: ['kb-articles', 'featured'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kb_articles')
        .select('*')
        .eq('status', 'published')
        .eq('is_featured', true)
        .order('sort_order', { ascending: true })
        .limit(5);

      if (error) throw error;
      return data as KBArticle[];
    },
  });

  // جلب الأسئلة الشائعة
  const { data: faqs, isLoading: faqsLoading } = useQuery({
    queryKey: ['kb-faqs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kb_faqs')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as KBFAQ[];
    },
  });

  // البحث في المقالات
  const searchArticles = async (searchTerm: string) => {
    const { data, error } = await supabase
      .from('kb_articles')
      .select('*')
      .eq('status', 'published')
      .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%,summary.ilike.%${searchTerm}%`)
      .order('views_count', { ascending: false })
      .limit(10);

    if (error) throw error;
    return data as KBArticle[];
  };

  // زيادة عدد المشاهدات
  const incrementViews = useMutation({
    mutationFn: async ({ id, type }: { id: string; type: 'article' | 'faq' }) => {
      const table = type === 'article' ? 'kb_articles' : 'kb_faqs';
      
      const { data: current } = await supabase
        .from(table)
        .select('views_count')
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from(table)
        .update({ views_count: (current?.views_count || 0) + 1 })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      if (variables.type === 'article') {
        queryClient.invalidateQueries({ queryKey: ['kb-articles'] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['kb-faqs'] });
      }
    },
  });

  // تقييم مقالة (مفيدة / غير مفيدة)
  const rateArticle = useMutation({
    mutationFn: async ({ id, helpful }: { id: string; helpful: boolean }) => {
      const column = helpful ? 'helpful_count' : 'not_helpful_count';
      
      const { data: current } = await supabase
        .from('kb_articles')
        .select(column)
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from('kb_articles')
        .update({ [column]: ((current?.[column] as number) || 0) + 1 })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kb-articles'] });
      toast.success('شكراً لتقييمك');
    },
  });

  return {
    articles,
    featuredArticles,
    faqs,
    articlesLoading,
    faqsLoading,
    searchArticles,
    incrementViews,
    rateArticle,
  };
}

/**
 * Hook لجلب مقالة واحدة
 */
export function useArticle(id: string) {
  const queryClient = useQueryClient();

  const { data: article, isLoading } = useQuery({
    queryKey: ['kb-article', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kb_articles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      // زيادة عدد المشاهدات
      await supabase
        .from('kb_articles')
        .update({ views_count: (data.views_count || 0) + 1 })
        .eq('id', id);

      return data as KBArticle;
    },
    enabled: !!id,
  });

  return { article, isLoading };
}
