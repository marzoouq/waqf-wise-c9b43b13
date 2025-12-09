/**
 * Hook لإدارة مستندات الإفصاح السنوي مع المحتوى المستخرج
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

export interface SmartDisclosureDocument {
  id: string;
  disclosure_id: string;
  document_name: string;
  document_type: string;
  file_path: string;
  file_size: number | null;
  description: string | null;
  fiscal_year: number;
  uploaded_by: string | null;
  created_at: string;
  extracted_content: Json | null;
  content_summary: string | null;
  total_amount: number | null;
  items_count: number | null;
}

export interface CategorySummary {
  type: string;
  label: string;
  count: number;
  totalAmount: number;
}

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  'فاتورة_خدمات': 'فواتير خدمات',
  'صيانة': 'صيانة',
  'زكاة_ضرائب': 'زكاة وضرائب',
  'تقرير_مالي': 'تقارير مالية',
  'خدمات_محاسبية': 'خدمات محاسبية',
  'مصاريف_عامة': 'مصاريف عامة',
  'اقفال_سنوي': 'إقفال سنوي',
};

export function useSmartDisclosureDocuments(disclosureId?: string) {
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["smart-disclosure-documents", disclosureId],
    queryFn: async () => {
      if (!disclosureId) return [];
      
      const { data, error } = await supabase
        .from("disclosure_documents")
        .select("*")
        .eq("disclosure_id", disclosureId)
        .order("document_type", { ascending: true });
      
      if (error) throw error;
      return data as SmartDisclosureDocument[];
    },
    enabled: !!disclosureId,
  });

  // حساب ملخص الفئات
  const categorySummary: CategorySummary[] = Object.entries(
    documents.reduce((acc, doc) => {
      const type = doc.document_type;
      if (!acc[type]) {
        acc[type] = {
          type,
          label: DOCUMENT_TYPE_LABELS[type] || type,
          count: 0,
          totalAmount: 0,
        };
      }
      acc[type].count += 1;
      acc[type].totalAmount += doc.total_amount || 0;
      return acc;
    }, {} as Record<string, CategorySummary>)
  ).map(([, value]) => value);

  return {
    documents,
    categorySummary,
    isLoading,
    getTypeLabel: (type: string) => DOCUMENT_TYPE_LABELS[type] || type,
  };
}
