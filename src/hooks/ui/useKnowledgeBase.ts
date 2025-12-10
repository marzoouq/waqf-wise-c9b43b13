import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { KnowledgeService } from '@/services/knowledge.service';
import { toast } from 'sonner';
import type { KBArticle, KBFAQ } from '@/types/support';
import { QUERY_KEYS } from '@/lib/query-keys';

/**
 * Hook لإدارة قاعدة المعرفة
 * @version 2.8.73 - Refactored to use KnowledgeService
 */
export function useKnowledgeBase() {
  const queryClient = useQueryClient();

  // جلب المقالات المنشورة
  const { data: articles, isLoading: articlesLoading } = useQuery({
    queryKey: QUERY_KEYS.KB_ARTICLES,
    queryFn: () => KnowledgeService.getKBArticles(),
  });

  // جلب المقالات المميزة
  const { data: featuredArticles } = useQuery({
    queryKey: [...QUERY_KEYS.KB_ARTICLES, 'featured'],
    queryFn: () => KnowledgeService.getFeaturedKBArticles(),
  });

  // جلب الأسئلة الشائعة
  const { data: faqs, isLoading: faqsLoading } = useQuery({
    queryKey: QUERY_KEYS.KB_FAQS,
    queryFn: () => KnowledgeService.getKBFAQs(),
  });

  // البحث في المقالات
  const searchArticles = async (searchTerm: string) => {
    return KnowledgeService.searchKBArticles(searchTerm);
  };

  // زيادة عدد المشاهدات
  const incrementViews = useMutation({
    mutationFn: async ({ id, type }: { id: string; type: 'article' | 'faq' }) => {
      if (type === 'article') {
        await KnowledgeService.incrementKBArticleViews(id);
      } else {
        await KnowledgeService.incrementFAQViews(id);
      }
    },
    onSuccess: (_, variables) => {
      if (variables.type === 'article') {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.KB_ARTICLES });
      } else {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.KB_FAQS });
      }
    },
  });

  // تقييم مقالة (مفيدة / غير مفيدة)
  const rateArticle = useMutation({
    mutationFn: async ({ id, helpful }: { id: string; helpful: boolean }) => {
      await KnowledgeService.rateKBArticle(id, helpful);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.KB_ARTICLES });
      toast.success('شكراً لتقييمك');
    },
  });

  return {
    articles: articles as KBArticle[] | undefined,
    featuredArticles: featuredArticles as KBArticle[] | undefined,
    faqs: faqs as KBFAQ[] | undefined,
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
  const { data: article, isLoading } = useQuery({
    queryKey: [...QUERY_KEYS.KB_ARTICLES, id],
    queryFn: async () => {
      const data = await KnowledgeService.getKBArticleById(id);
      if (!data) throw new Error('المقالة غير موجودة');
      
      // زيادة عدد المشاهدات
      await KnowledgeService.incrementKBArticleViews(id);
      
      return data;
    },
    enabled: !!id,
  });

  return { article: article as KBArticle | undefined, isLoading };
}
