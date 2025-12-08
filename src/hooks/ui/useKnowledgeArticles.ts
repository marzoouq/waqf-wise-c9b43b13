/**
 * Hook for Knowledge Base Articles
 * خطاف لإدارة مقالات قاعدة المعرفة
 */
import { useQuery } from "@tanstack/react-query";
import { KnowledgeService, type KnowledgeArticle } from "@/services";

export type { KnowledgeArticle };

export interface KnowledgeFAQ {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  is_published: boolean;
}

// Fallback FAQs
const FALLBACK_FAQS: KnowledgeFAQ[] = [
  { id: '1', question: "كيف أقوم بتسجيل مستفيد جديد؟", answer: "اذهب إلى قسم المستفيدون ثم اضغط على إضافة مستفيد.", sort_order: 1, is_published: true },
  { id: '2', question: "كيف يتم اعتماد التوزيعات المالية؟", answer: "التوزيعات تمر بـ 3 مراحل موافقة.", sort_order: 2, is_published: true },
  { id: '3', question: "ما هي أنواع التقارير المتاحة؟", answer: "النظام يوفر 15+ تقرير مالي وإداري.", sort_order: 3, is_published: true },
];

export function useKnowledgeArticles() {
  return useQuery({
    queryKey: ['knowledge-articles'],
    queryFn: () => KnowledgeService.getArticles(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useKnowledgeFAQs() {
  return useQuery({
    queryKey: ['knowledge-faqs'],
    queryFn: async () => FALLBACK_FAQS,
    staleTime: 1000 * 60 * 5,
  });
}
