import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { KBArticle, KBFAQ } from '@/types/support';

export function useKnowledgeBase() {
  const queryClient = useQueryClient();

  // Fetch articles
  const { data: articles, isLoading: articlesLoading } = useQuery({
    queryKey: ['kb-articles'],
    queryFn: async () => {
      const { data, error }: any = await supabase
        .from('kb_articles')
        .select('*')
        .eq('status', 'published')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as KBArticle[];
    },
  });

  // Fetch featured articles
  const { data: featuredArticles } = useQuery({
    queryKey: ['kb-featured-articles'],
    queryFn: async () => {
      const { data, error }: any = await supabase
        .from('kb_articles')
        .select('*')
        .eq('status', 'published')
        .eq('is_featured', true)
        .order('views_count', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data as KBArticle[];
    },
  });

  // Fetch FAQs
  const { data: faqs, isLoading: faqsLoading } = useQuery({
    queryKey: ['kb-faqs'],
    queryFn: async () => {
      const { data, error }: any = await supabase
        .from('kb_faqs')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as KBFAQ[];
    },
  });

  // Search articles
  const searchArticles = async (query: string) => {
    const { data, error }: any = await supabase
      .from('kb_articles')
      .select('*')
      .eq('status', 'published')
      .or(`title.ilike.%${query}%,content.ilike.%${query}%,summary.ilike.%${query}%`)
      .order('views_count', { ascending: false })
      .limit(10);

    if (error) throw error;
    return data as KBArticle[];
  };

  // Increment views
  const incrementViews = useMutation({
    mutationFn: async (articleId: string) => {
      const { error }: any = await supabase
        .from('kb_articles')
        .update({ views_count: supabase.sql`views_count + 1` })
        .eq('id', articleId);
      if (error) console.error('Error incrementing views:', error);
    },
  });

  // Rate article as helpful
  const rateHelpful = useMutation({
    mutationFn: async ({ articleId, helpful }: { articleId: string; helpful: boolean }) => {
      const field = helpful ? 'helpful_count' : 'not_helpful_count';
      const { error }: any = await supabase
        .from('kb_articles')
        .update({ [field]: supabase.sql`${field} + 1` })
        .eq('id', articleId);
      if (error) console.error('Error rating article:', error);
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
    rateHelpful,
  };
}

// Hook لمقال واحد
export function useArticle(id: string) {
  const { incrementViews } = useKnowledgeBase();

  const { data: article, isLoading } = useQuery({
    queryKey: ['kb-article', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kb_articles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      // Increment views
      incrementViews.mutate(id);
      
      return data as KBArticle;
    },
    enabled: !!id,
  });

  return { article, isLoading };
}
